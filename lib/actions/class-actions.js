/**
 * Server Actions — Turmas (Class)
 *
 * Todas as actions seguem o padrão:
 *   { data: T | null, error: string | null }
 *
 * Nunca lançam exceções não tratadas.
 * Todas as queries filtram por teacherId para multi-tenancy.
 *
 * Uso:
 *   "use server";
 *   import { getClasses, createClass } from "@/lib/actions/class-actions";
 *   const result = await getClasses(teacherId);
 */

"use server";

import prisma from "@/lib/db/prisma";
import { canCreateClass } from "@/lib/plans/gate";
import {
  createClassSchema,
  updateClassSchema,
  validate,
} from "@/lib/validation/schemas";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Verifica se a turma pertence ao professor (multi-tenancy)
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
 * Formata erro de Prisma para mensagem amigável
 * @param {unknown} error
 * @returns {string}
 */
function formatError(error) {
  if (error && typeof error === "object" && "code" in error) {
    const code = error.code;
    switch (code) {
      case "P2002":
        return "Já existe uma turma com este nome.";
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

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Lista todas as turmas do professor com contagem de alunos
 * @param {string} teacherId
 * @returns {Promise<{ data: import('@/types').ClassWithStudentCount[] | null, error: string | null }>}
 */
export async function getClasses(teacherId) {
  try {
    if (!teacherId) {
      return { data: null, error: "ID do professor é obrigatório." };
    }

    const classes = await prisma.class.findMany({
      where: {
        teacherId,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        teacherId: true,
        name: true,
        subject: true,
        year: true,
        period: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        _count: {
          select: { students: { where: { deletedAt: null } } },
        },
      },
    });

    return { data: classes, error: null };
  } catch (error) {
    console.error("[Class Actions] getClasses error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Busca uma turma específica com todos os alunos
 * @param {string} classId
 * @param {string} teacherId
 * @returns {Promise<{ data: import('@/types').ClassWithStudents | null, error: string | null }>}
 */
export async function getClass(classId, teacherId) {
  try {
    if (!classId || !teacherId) {
      return { data: null, error: "ID da turma e do professor são obrigatórios." };
    }

    const isOwner = await isTeacherClass(classId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Turma não encontrada ou não pertence a você." };
    }

    const classItem = await prisma.class.findUnique({
      where: { id: classId, deletedAt: null },
      include: {
        students: {
          where: { deletedAt: null },
          orderBy: { name: "asc" },
        },
      },
    });

    return { data: classItem, error: null };
  } catch (error) {
    console.error("[Class Actions] getClass error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Cria uma nova turma
 * @param {import('@/types').CreateClassInput} input
 * @param {string} teacherId
 * @returns {Promise<{ data: import('@/types').Class | null, error: string | null }>}
 */
export async function createClass(input, teacherId) {
  try {
    if (!teacherId) {
      return { data: null, error: "ID do professor é obrigatório." };
    }

    // Verificação de plano
    const planCheck = await canCreateClass(teacherId);
    if (!planCheck.allowed) {
      return {
        data: null,
        error: "PLAN_LIMIT_EXCEEDED",
        feature: "maxClasses",
        reason: planCheck.reason,
        currentUsage: planCheck.currentUsage,
        maxAllowed: planCheck.maxAllowed,
      };
    }

    // Validação Zod
    const validation = validate(createClassSchema, input);
    if (validation.error) {
      return { data: null, error: validation.error };
    }

    const { name, subject, year, period } = validation.data;

    const newClass = await prisma.class.create({
      data: {
        teacherId,
        name,
        subject: subject || null,
        year: year || new Date().getFullYear().toString(),
        period: period || null,
      },
    });

    return { data: newClass, error: null };
  } catch (error) {
    console.error("[Class Actions] createClass error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Atualiza uma turma existente
 * @param {string} classId
 * @param {import('@/types').UpdateClassInput} input
 * @param {string} teacherId
 * @returns {Promise<{ data: import('@/types').Class | null, error: string | null }>}
 */
export async function updateClass(classId, input, teacherId) {
  try {
    if (!classId || !teacherId) {
      return { data: null, error: "ID da turma e do professor são obrigatórios." };
    }

    // Validação
    const validation = validate(updateClassSchema, input);
    if (validation.error) {
      return { data: null, error: validation.error };
    }

    // Multi-tenancy
    const isOwner = await isTeacherClass(classId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Turma não encontrada ou não pertence a você." };
    }

    const updated = await prisma.class.update({
      where: { id: classId },
      data: {
        ...validation.data,
        subject: validation.data.subject === "" ? null : validation.data.subject,
        period: validation.data.period === "" ? null : validation.data.period,
      },
    });

    return { data: updated, error: null };
  } catch (error) {
    console.error("[Class Actions] updateClass error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Soft delete de uma turma
 * @param {string} classId
 * @param {string} teacherId
 * @returns {Promise<{ data: boolean, error: string | null }>}
 */
export async function deleteClass(classId, teacherId) {
  try {
    if (!classId || !teacherId) {
      return { data: false, error: "ID da turma e do professor são obrigatórios." };
    }

    const isOwner = await isTeacherClass(classId, teacherId);
    if (!isOwner) {
      return { data: false, error: "Turma não encontrada ou não pertence a você." };
    }

    await prisma.class.update({
      where: { id: classId },
      data: { deletedAt: new Date() },
    });

    return { data: true, error: null };
  } catch (error) {
    console.error("[Class Actions] deleteClass error:", error);
    return { data: false, error: formatError(error) };
  }
}

/**
 * Duplica uma turma (copia dados, não alunos)
 * @param {string} classId
 * @param {string} teacherId
 * @returns {Promise<{ data: import('@/types').Class | null, error: string | null }>}
 */
export async function duplicateClass(classId, teacherId) {
  try {
    if (!classId || !teacherId) {
      return { data: null, error: "ID da turma e do professor são obrigatórios." };
    }

    const isOwner = await isTeacherClass(classId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Turma não encontrada ou não pertence a você." };
    }

    const original = await prisma.class.findUnique({
      where: { id: classId, deletedAt: null },
    });

    if (!original) {
      return { data: null, error: "Turma original não encontrada." };
    }

    const duplicated = await prisma.class.create({
      data: {
        teacherId,
        name: `${original.name} (cópia)`,
        subject: original.subject,
        year: original.year,
        period: original.period,
      },
    });

    return { data: duplicated, error: null };
  } catch (error) {
    console.error("[Class Actions] duplicateClass error:", error);
    return { data: null, error: formatError(error) };
  }
}
