/**
 * Server Actions — Alunos (Student)
 *
 * Todas as actions seguem o padrão:
 *   { data: T | null, error: string | null }
 *
 * Inclui parser CSV para importação em lote com relatório de erros.
 *
 * Uso:
 *   "use server";
 *   import { getStudents, importStudentsFromCSV } from "@/lib/actions/student-actions";
 */

"use server";

import prisma from "@/lib/db/prisma";
import { encryptField, decryptField } from "@/lib/crypto/sensitive-fields";
import {
  createStudentSchema,
  updateStudentSchema,
  csvRowSchema,
  validate,
} from "@/lib/validation/schemas";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Verifica se o professor é dono da turma (multi-tenancy)
 * @param {string} classId
 * @param {string} teacherId
 * @returns {Promise<boolean>}
 */
async function isTeacherClass(classId, teacherId) {
  const count = await prisma.class.count({
    where: {
      id: classId,
      teacherId,
      deletedAt: null,
    },
  });
  return count > 0;
}

/**
 * Verifica se o aluno pertence a uma turma do professor
 * @param {string} studentId
 * @param {string} teacherId
 * @returns {Promise<boolean>}
 */
async function isTeacherStudent(studentId, teacherId) {
  const count = await prisma.student.count({
    where: {
      id: studentId,
      class: {
        teacherId,
        deletedAt: null,
      },
      deletedAt: null,
    },
  });
  return count > 0;
}

/**
 * Formata erro de Prisma para mensagem amigável
 * @param {unknown} error
 * @returns {string}
 */
function formatError(error) {
  if (error && typeof error === "object" && "code" in error) {
    const code = error.code;
    switch (code) {
      case "P2002":
        return "Já existe um aluno com este nome nesta turma.";
      case "P2025":
        return "Registro não encontrado.";
      case "P2003":
        return "Referência inválida. Verifique os dados informados.";
      default:
        return "Erro ao processar a operação no banco de dados.";
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
}

// ─── CSV Parser ──────────────────────────────────────────────────────────────

/**
 * Parser de CSV simples (não usa biblioteca externa)
 * Aceita colunas: nome, necessidades, diagnostico, obs
 * Suporta separadores: vírgula, ponto-e-vírgula, tab
 *
 * @param {string} csvContent
 * @returns {{ rows: import('@/types').CSVStudentRow[], errors: string[] }}
 */
function parseCSV(csvContent) {
  /** @type {import('@/types').CSVStudentRow[]} */
  const rows = [];
  /** @type {string[]} */
  const errors = [];

  const lines = csvContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return { rows, errors: ["Arquivo CSV vazio."] };
  }

  // Detecta o separador (vírgula, ponto-e-vírgula ou tab)
  const firstLine = lines[0];
  const separator = firstLine.includes(";")
    ? ";"
    : firstLine.includes("\t")
      ? "\t"
      : ",";

  // Detecta se tem header
  let startIndex = 0;
  const headerFields = lines[0].split(separator).map((h) => h.trim().toLowerCase());
  const hasNomeHeader = headerFields.some(
    (h) => h === "nome" || h === "name" || h === "aluno" || h === "nome do aluno"
  );

  if (hasNomeHeader) {
    startIndex = 1; // Pula header
  }

  // Mapeia índices das colunas pelo header ou posição fixa
  let colNome = 0;
  let colNecessidades = 1;
  let colDiagnostico = 2;
  let colObs = 3;

  if (hasNomeHeader) {
    const nomeIdx = headerFields.findIndex(
      (h) => h === "nome" || h === "name" || h === "aluno" || h === "nome do aluno"
    );
    const necIdx = headerFields.findIndex(
      (h) => h.includes("necessidade") || h.includes("need") || h === "nees"
    );
    const diagIdx = headerFields.findIndex(
      (h) => h.includes("diagn") || h.includes("diag") || h.includes("condi") || h.includes("tipo")
    );
    const obsIdx = headerFields.findIndex(
      (h) => h.includes("obs") || h.includes("nota") || h.includes("note") || h.includes("coment")
    );

    if (nomeIdx !== -1) colNome = nomeIdx;
    if (necIdx !== -1) colNecessidades = necIdx;
    if (diagIdx !== -1) colDiagnostico = diagIdx;
    if (obsIdx !== -1) colObs = obsIdx;
  }

  // Processa cada linha
  for (let i = startIndex; i < lines.length; i++) {
    const lineNum = i + 1;
    const parts = lines[i].split(separator).map((p) => p.trim());

    // Extrai campos
    const nome = parts[colNome];
    const necessidades = parts[colNecessidades] || "";
    const diagnostico = parts[colDiagnostico] || "";
    const obs = parts[colObs] || "";

    // Validação básica
    if (!nome || nome.length < 2) {
      errors.push(`Linha ${lineNum}: Nome inválido ou vazio.`);
      continue;
    }

    // Normaliza diagnóstico
    let normalizedDiag = null;
    const diagUpper = diagnostico.toUpperCase().trim();
    if (diagUpper) {
      const validTypes = [
        "TEA", "TDAH", "TOD", "DISLEXIA", "DISCALCULIA",
        "ALTAS_HABILIDADES", "OUTRO", "NAO_INFORMADO",
      ];
      const found = validTypes.find((t) => diagUpper.includes(t.replace("_", " ")));
      if (found) {
        normalizedDiag = found;
      }
    }

    /** @type {import('@/types').CSVStudentRow} */
    const row = {
      nome: nome.trim(),
      necessidades:
        necessidades.toLowerCase().trim() === "sim" ||
        necessidades.trim().toLowerCase() === "s" ||
        necessidades.trim() === "1" ||
        necessidades.trim().toLowerCase() === "true" ||
        necessidades.trim().toLowerCase() === "yes",
      diagnostico: normalizedDiag,
      obs: obs || null,
    };

    // Validação com Zod
    const validation = validate(csvRowSchema, row);
    if (validation.error) {
      errors.push(`Linha ${lineNum}: ${validation.error}`);
      continue;
    }

    rows.push(validation.data);
  }

  return { rows, errors };
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Lista todos os alunos de uma turma
 * @param {string} classId
 * @param {string} teacherId
 * @returns {Promise<{ data: import('@/types').Student[] | null, error: string | null }>}
 */
export async function getStudents(classId, teacherId) {
  try {
    if (!classId || !teacherId) {
      return { data: null, error: "ID da turma e do professor são obrigatórios." };
    }

    const isOwner = await isTeacherClass(classId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Turma não encontrada ou não pertence a você." };
    }

    const students = await prisma.student.findMany({
      where: {
        classId,
        deletedAt: null,
      },
      orderBy: { name: "asc" },
    });

    // LGPD: Só descriptografa diagnosis_notes se parent_consent = true
    const sanitizedStudents = students.map((s) => {
      const { diagnosisNotes, ...rest } = s;
      return {
        ...rest,
        // diagnosis_notes só é retornado descriptografado se houver consentimento
        diagnosisNotes: s.parentConsent && s.diagnosisNotes
          ? decryptField(s.diagnosisNotes)
          : null,
      };
    });

    return { data: sanitizedStudents, error: null };
  } catch (error) {
    console.error("[Student Actions] getStudents error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Cria um novo aluno
 * @param {import('@/types').CreateStudentInput} input
 * @param {string} classId
 * @param {string} teacherId
 * @returns {Promise<{ data: import('@/types').Student | null, error: string | null }>}
 */
export async function createStudent(input, classId, teacherId) {
  try {
    if (!classId || !teacherId) {
      return { data: null, error: "ID da turma e do professor são obrigatórios." };
    }

    const isOwner = await isTeacherClass(classId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Turma não encontrada ou não pertence a você." };
    }

    // Validação
    const validation = validate(createStudentSchema, input);
    if (validation.error) {
      return { data: null, error: validation.error };
    }

    const student = await prisma.student.create({
      data: {
        classId,
        ...validation.data,
        // Criptografa dados sensíveis antes de salvar
        diagnosisNotes: validation.data.diagnosisNotes
          ? encryptField(validation.data.diagnosisNotes)
          : null,
      },
    });

    return { data: student, error: null };
  } catch (error) {
    console.error("[Student Actions] createStudent error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Atualiza dados de um aluno
 * @param {string} studentId
 * @param {import('@/types').UpdateStudentInput} input
 * @param {string} teacherId
 * @returns {Promise<{ data: import('@/types').Student | null, error: string | null }>}
 */
export async function updateStudent(studentId, input, teacherId) {
  try {
    if (!studentId || !teacherId) {
      return { data: null, error: "ID do aluno e do professor são obrigatórios." };
    }

    const isOwner = await isTeacherStudent(studentId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Aluno não encontrado ou não pertence à sua turma." };
    }

    // Validação
    const validation = validate(updateStudentSchema, input);
    if (validation.error) {
      return { data: null, error: validation.error };
    }

    // Criptografa diagnosis_notes se fornecido
    const encryptedNotes = validation.data.diagnosisNotes
      ? encryptField(validation.data.diagnosisNotes)
      : undefined;

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        ...validation.data,
        diagnosisNotes: encryptedNotes,
      },
    });

    return { data: updated, error: null };
  } catch (error) {
    console.error("[Student Actions] updateStudent error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Soft delete de um aluno
 * @param {string} studentId
 * @param {string} teacherId
 * @returns {Promise<{ data: boolean, error: string | null }>}
 */
export async function deleteStudent(studentId, teacherId) {
  try {
    if (!studentId || !teacherId) {
      return { data: false, error: "ID do aluno e do professor são obrigatórios." };
    }

    const isOwner = await isTeacherStudent(studentId, teacherId);
    if (!isOwner) {
      return { data: false, error: "Aluno não encontrado ou não pertence à sua turma." };
    }

    await prisma.student.update({
      where: { id: studentId },
      data: { deletedAt: new Date() },
    });

    return { data: true, error: null };
  } catch (error) {
    console.error("[Student Actions] deleteStudent error:", error);
    return { data: false, error: formatError(error) };
  }
}

/**
 * Importa alunos de conteúdo CSV
 *
 * Formato aceito:
 *   nome; necessidades (sim/não); diagnostico; obs
 *   João Silva; sim; TEA; Laudo de 2024
 *   Maria Santos; não; ;
 *
 * @param {string} csvContent
 * @param {string} classId
 * @param {string} teacherId
 * @returns {Promise<{ data: import('@/types').ImportResult | null, error: string | null }>}
 */
export async function importStudentsFromCSV(csvContent, classId, teacherId) {
  try {
    if (!classId || !teacherId) {
      return { data: null, error: "ID da turma e do professor são obrigatórios." };
    }

    const isOwner = await isTeacherClass(classId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Turma não encontrada ou não pertence a você." };
    }

    if (!csvContent || csvContent.trim().length === 0) {
      return { data: null, error: "Conteúdo CSV vazio." };
    }

    // Parse CSV
    const { rows, errors: parseErrors } = parseCSV(csvContent);

    if (rows.length === 0 && parseErrors.length > 0) {
      return {
        data: { created: 0, errors: parseErrors },
        error: null, // Não é erro — retorna relatório
      };
    }

    if (rows.length === 0) {
      return { data: null, error: "Nenhum aluno válido encontrado no CSV." };
    }

    // Cria alunos em batch
    const created = await prisma.student.createMany({
      data: rows.map((row) => ({
        classId,
        name: row.nome,
        hasAccessibilityNeeds: row.necessidades,
        diagnosisType: row.diagnostico,
        diagnosisNotes: row.obs,
        prioritySeating: row.necessidades, // Alunos com necessidades → assento prioritário
        parentConsent: false,
      })),
      skipDuplicates: true,
    });

    /** @type {import('@/types').ImportResult} */
    const result = {
      created: created.count,
      errors: parseErrors,
    };

    return { data: result, error: null };
  } catch (error) {
    console.error("[Student Actions] importStudentsFromCSV error:", error);
    return {
      data: null,
      error: `Erro ao importar alunos: ${formatError(error)}`,
    };
  }
}

/**
 * Conta alunos de uma turma
 * @param {string} classId
 * @param {string} teacherId
 * @returns {Promise<{ data: number, error: string | null }>}
 */
export async function countStudents(classId, teacherId) {
  try {
    if (!classId || !teacherId) {
      return { data: 0, error: "ID da turma e do professor são obrigatórios." };
    }

    const isOwner = await isTeacherClass(classId, teacherId);
    if (!isOwner) {
      return { data: 0, error: "Turma não encontrada." };
    }

    const count = await prisma.student.count({
      where: { classId, deletedAt: null },
    });

    return { data: count, error: null };
  } catch (error) {
    console.error("[Student Actions] countStudents error:", error);
    return { data: 0, error: formatError(error) };
  }
}
