/**
 * Server Actions — Diário de Bordo (AccessibilityLog)
 *
 * Todas as ações seguem o padrão:
 *   { data: T | null, error: string | null }
 *
 * Multi-tenancy: todas as queries verificam teacherId.
 * LGPD: visibilidade controlada, dados sensíveis protegidos.
 *
 * Uso:
 *   "use server";
 *   import { createLog, getLogs } from "@/lib/actions/log-actions";
 */

"use server";

import prisma from "@/lib/db/prisma";
import { encryptField, decryptField } from "@/lib/crypto/sensitive-fields";
import { canCreateLog, canExportPDF } from "@/lib/plans/gate";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Verifica se o professor tem acesso ao aluno (multi-tenancy)
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
 * Verifica se o log pertence a um aluno do professor
 * @param {string} logId
 * @param {string} teacherId
 * @returns {Promise<boolean>}
 */
async function isTeacherLog(logId, teacherId) {
  const count = await prisma.accessibilityLog.count({
    where: {
      id: logId,
      deletedAt: null, // Soft delete
      student: {
        class: {
          teacherId,
          deletedAt: null,
        },
        deletedAt: null,
      },
    },
  });
  return count > 0;
}

/**
 * Formata erro de Prisma
 * @param {unknown} error
 * @returns {string}
 */
function formatError(error) {
  if (error && typeof error === "object" && "code" in error) {
    switch (error.code) {
      case "P2025":
        return "Registro não encontrado.";
      case "P2003":
        return "Referência inválida. Verifique os dados.";
      default:
        return "Erro ao processar a operação no banco de dados.";
    }
  }
  if (error instanceof Error) return error.message;
  return "Ocorreu um erro inesperado.";
}

// ─── Validation ──────────────────────────────────────────────────────────────

const validCategories = [
  "COMPORTAMENTO",
  "CRISE",
  "PROGRESSO",
  "COMUNICACAO_FAMILIA",
  "AVALIACAO",
  "OUTRO",
];

const validVisibilities = ["PRIVATE", "SCHOOL", "FAMILY"];

/**
 * Valida dados de criação de log
 * @param {Object} data
 * @returns {{ data: Object | null, error: string | null }}
 */
function validateLogInput(data) {
  if (!data.studentId) return { data: null, error: "Aluno é obrigatório." };
  if (!data.category) return { data: null, error: "Categoria é obrigatória." };
  if (!validCategories.includes(data.category)) {
    return {
      data: null,
      error: `Categoria deve ser uma das seguintes: ${validCategories.join(", ")}.`,
    };
  }
  if (!data.description || data.description.trim().length < 10) {
    return {
      data: null,
      error: "Descrição deve ter pelo menos 10 caracteres.",
    };
  }
  if (data.description.trim().length > 5000) {
    return {
      data: null,
      error: "Descrição deve ter no máximo 5000 caracteres.",
    };
  }
  if (data.visibility && !validVisibilities.includes(data.visibility)) {
    return {
      data: null,
      error: `Visibilidade deve ser uma das seguintes: ${validVisibilities.join(", ")}.`,
    };
  }

  return {
    data: {
      studentId: data.studentId,
      category: data.category,
      description: data.description.trim(),
      visibility: data.visibility || "PRIVATE",
      logDate: data.logDate ? new Date(data.logDate) : new Date(),
    },
    error: null,
  };
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Cria uma nova entrada no Diário de Bordo
 * @param {Object} data
 * @param {string} data.studentId
 * @param {string} data.category
 * @param {string} data.description
 * @param {string} [data.visibility]
 * @param {Date|string} [data.logDate]
 * @param {string} teacherId
 * @returns {Promise<{ data: Object | null, error: string | null }>}
 */
export async function createLog(data, teacherId) {
  try {
    if (!teacherId) {
      return { data: null, error: "ID do professor é obrigatório." };
    }

    // Verificação de plano (Diário de Bordo é feature Premium)
    const planCheck = await canCreateLog(teacherId);
    if (!planCheck.allowed) {
      return {
        data: null,
        error: "PLAN_LIMIT_EXCEEDED",
        feature: "diaryLogs",
        reason: planCheck.reason,
      };
    }

    // Validação
    const validation = validateLogInput(data);
    if (validation.error) {
      return { data: null, error: validation.error };
    }

    // Multi-tenancy
    const isOwner = await isTeacherStudent(data.studentId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Aluno não encontrado na sua turma." };
    }

    const log = await prisma.accessibilityLog.create({
      data: {
        studentId: validation.data.studentId,
        teacherId,
        category: validation.data.category,
        // Criptografa descrição (dado sensível)
        description: encryptField(validation.data.description),
        visibility: validation.data.visibility,
        logDate: validation.data.logDate,
      },
    });

    return { data: log, error: null };
  } catch (error) {
    console.error("[Log Actions] createLog error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Busca todas as entradas do diário de um aluno
 * @param {string} studentId
 * @param {string} teacherId
 * @returns {Promise<{ data: Object[] | null, error: string | null }>}
 */
export async function getLogs(studentId, teacherId) {
  try {
    if (!studentId || !teacherId) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherStudent(studentId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Aluno não encontrado na sua turma." };
    }

    // LGPD: PRIVATE logs só visíveis para o professor que os criou
    const logs = await prisma.accessibilityLog.findMany({
      where: {
        studentId,
        deletedAt: null, // Soft delete: ignora logs deletados
        OR: [
          { teacherId }, // logs criados por este professor
          { visibility: { in: ["SCHOOL", "FAMILY"] } }, // logs compartilhados
        ],
      },
      orderBy: { logDate: "desc" },
    });

    // Descriptografa descrições (dados sensíveis)
    const decryptedLogs = logs.map((log) => ({
      ...log,
      description: decryptField(log.description),
    }));

    return { data: decryptedLogs, error: null };
  } catch (error) {
    console.error("[Log Actions] getLogs error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Busca entradas do diário com filtros
 * @param {string} studentId
 * @param {string} teacherId
 * @param {Object} filters
 * @param {string} [filters.category]
 * @param {Date} [filters.startDate]
 * @param {Date} [filters.endDate]
 * @param {string} [filters.visibility]
 * @returns {Promise<{ data: Object[] | null, error: string | null }>}
 */
export async function getLogsFiltered(studentId, teacherId, filters = {}) {
  try {
    if (!studentId || !teacherId) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherStudent(studentId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Aluno não encontrado na sua turma." };
    }

    /** @type {Object} */
    const where = {
      studentId,
      // LGPD: PRIVATE logs só visíveis para o professor que os criou
      OR: [
        { teacherId },
        { visibility: { in: ["SCHOOL", "FAMILY"] } },
      ],
    };

    if (filters.category) {
      // Aplica filtro DENTRO do OR — reestrutura where
    }
    if (filters.visibility) {
      // Aplica filtro DENTRO do OR
    }
    if (filters.startDate || filters.endDate) {
      // Aplica filtro de data
    }

    // Reconstroi where com filtros e OR combinados
    const finalWhere = {
      studentId,
      deletedAt: null, // Soft delete
      OR: [
        { teacherId },
        { visibility: { in: ["SCHOOL", "FAMILY"] } },
      ],
    };

    if (filters.category) {
      finalWhere.category = filters.category;
    }
    if (filters.visibility) {
      finalWhere.visibility = filters.visibility;
    }
    if (filters.startDate || filters.endDate) {
      finalWhere.logDate = {};
      if (filters.startDate) {
        finalWhere.logDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        finalWhere.logDate.lte = filters.endDate;
      }
    }

    const logs = await prisma.accessibilityLog.findMany({
      where: finalWhere,
      orderBy: { logDate: "desc" },
    });

    // Descriptografa descrições
    const decryptedLogs = logs.map((log) => ({
      ...log,
      description: decryptField(log.description),
    }));

    return { data: decryptedLogs, error: null };
  } catch (error) {
    console.error("[Log Actions] getLogsFiltered error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Atualiza uma entrada do diário
 * @param {string} logId
 * @param {Object} data
 * @param {string} [data.category]
 * @param {string} [data.description]
 * @param {string} [data.visibility]
 * @param {string} teacherId
 * @returns {Promise<{ data: Object | null, error: string | null }>}
 */
export async function updateLog(logId, data, teacherId) {
  try {
    if (!logId || !teacherId) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherLog(logId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Registro não encontrado." };
    }

    const existing = await prisma.accessibilityLog.findUnique({
      where: { id: logId },
    });

    if (!existing) {
      return { data: null, error: "Registro não encontrado." };
    }

    // Validação parcial
    if (data.category && !validCategories.includes(data.category)) {
      return {
        data: null,
        error: `Categoria inválida.`,
      };
    }
    if (data.description && data.description.trim().length < 10) {
      return {
        data: null,
        error: "Descrição deve ter pelo menos 10 caracteres.",
      };
    }
    if (data.visibility && !validVisibilities.includes(data.visibility)) {
      return {
        data: null,
        error: `Visibilidade inválida.`,
      };
    }

    const updated = await prisma.accessibilityLog.update({
      where: { id: logId },
      data: {
        category: data.category || existing.category,
        description: data.description
          ? encryptField(data.description.trim())
          : existing.description,
        visibility: data.visibility || existing.visibility,
        logDate: data.logDate ? new Date(data.logDate) : existing.logDate,
      },
    });

    return { data: updated, error: null };
  } catch (error) {
    console.error("[Log Actions] updateLog error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Deleta uma entrada do diário
 * @param {string} logId
 * @param {string} teacherId
 * @returns {Promise<{ data: boolean, error: string | null }>}
 */
export async function deleteLog(logId, teacherId) {
  try {
    if (!logId || !teacherId) {
      return { data: false, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherLog(logId, teacherId);
    if (!isOwner) {
      return { data: false, error: "Registro não encontrado." };
    }

    // Soft delete (preserva para auditoria LGPD)
    await prisma.accessibilityLog.update({
      where: { id: logId },
      data: { deletedAt: new Date() },
    });

    return { data: true, error: null };
  } catch (error) {
    console.error("[Log Actions] deleteLog error:", error);
    return { data: false, error: formatError(error) };
  }
}

/**
 * Conta entradas do diário de um aluno
 * @param {string} studentId
 * @param {string} teacherId
 * @returns {Promise<{ data: number, error: string | null }>}
 */
export async function countLogs(studentId, teacherId) {
  try {
    if (!studentId || !teacherId) {
      return { data: 0, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherStudent(studentId, teacherId);
    if (!isOwner) {
      return { data: 0, error: "Aluno não encontrado na sua turma." };
    }

    const count = await prisma.accessibilityLog.count({
      where: { studentId, deletedAt: null },
    });

    return { data: count, error: null };
  } catch (error) {
    console.error("[Log Actions] countLogs error:", error);
    return { data: 0, error: formatError(error) };
  }
}

/**
 * Busca a última entrada do diário de um aluno
 * @param {string} studentId
 * @param {string} teacherId
 * @returns {Promise<{ data: Object | null, error: string | null }>}
 */
export async function getLastLog(studentId, teacherId) {
  try {
    if (!studentId || !teacherId) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherStudent(studentId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Aluno não encontrado na sua turma." };
    }

    const lastLog = await prisma.accessibilityLog.findFirst({
      where: { studentId, deletedAt: null },
      orderBy: { logDate: "desc" },
    });

    // Descriptografa descrição se houver
    if (lastLog) {
      lastLog.description = decryptField(lastLog.description);
    }

    return { data: lastLog, error: null };
  } catch (error) {
    console.error("[Log Actions] getLastLog error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Exporta logs do diário de bordo para PDF (feature Premium)
 *
 * @param {string} studentId
 * @param {Object} dateRange
 * @param {Date} [dateRange.startDate]
 * @param {Date} [dateRange.endDate]
 * @param {string} teacherId
 * @returns {Promise<{ data: Object | null, error: string | null }>}
 */
export async function exportLogs(studentId, dateRange = {}, teacherId) {
  try {
    if (!studentId || !teacherId) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    // Verifica multi-tenancy
    const isOwner = await isTeacherStudent(studentId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Aluno não encontrado na sua turma." };
    }

    // Verifica plano (exportPDF é feature Premium)
    const planCheck = await canExportPDF(teacherId);
    if (!planCheck.allowed) {
      return {
        data: null,
        error: "PLAN_LIMIT_EXCEEDED",
        feature: "exportPDF",
        reason: planCheck.reason,
      };
    }

    // Busca logs (com descriptografia)
    const where = {
      studentId,
      deletedAt: null,
    };

    if (dateRange.startDate || dateRange.endDate) {
      where.logDate = {};
      if (dateRange.startDate) where.logDate.gte = dateRange.startDate;
      if (dateRange.endDate) where.logDate.lte = dateRange.endDate;
    }

    const logs = await prisma.accessibilityLog.findMany({
      where,
      orderBy: { logDate: "desc" },
    });

    // Descriptografa descrições
    const decryptedLogs = logs.map((log) => ({
      ...log,
      description: decryptField(log.description),
    }));

    // TODO: Implementar geração de PDF real (feature premium)
    // Por enquanto, retorna os dados descriptografados para o frontend gerar o PDF
    return {
      data: {
        logs: decryptedLogs,
        studentId,
        exportedAt: new Date().toISOString(),
        totalEntries: decryptedLogs.length,
      },
      error: null,
    };
  } catch (error) {
    console.error("[Log Actions] exportLogs error:", error);
    return { data: null, error: formatError(error) };
  }
}
