/**
 * Server Actions — Regras de Posicionamento (SeatingRule)
 *
 * Todas as ações seguem o padrão:
 *   { data: T | null, error: string | null }
 *
 * Multi-tenancy: todas as queries filtram por teacherId.
 *
 * Uso:
 *   "use server";
 *   import { getRules, createRule } from "@/lib/actions/rule-actions";
 */

"use server";

import prisma from "@/lib/db/prisma";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Verifica se a regra pertence a uma turma do professor
 * @param {string} ruleId
 * @param {string} teacherId
 * @returns {Promise<boolean>}
 */
async function isTeacherRule(ruleId, teacherId) {
  const count = await prisma.seatingRule.count({
    where: {
      id: ruleId,
      class: {
        teacherId,
        deletedAt: null,
      },
    },
  });
  return count > 0;
}

/**
 * Verifica se o professor é dono da turma
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

/**
 * Valida dados de criação de regra
 * @param {Object} data
 * @returns {{ data: Object | null, error: string | null }}
 */
function validateRuleInput(data) {
  const validRuleTypes = [
    "KEEP_TOGETHER",
    "KEEP_APART",
    "NEAR_FRONT",
    "NEAR_TEACHER",
    "NEAR_EXIT",
    "AVOID_WINDOW",
  ];

  if (!data.classId) return { data: null, error: "classId é obrigatório." };
  if (!data.ruleType) return { data: null, error: "ruleType é obrigatório." };
  if (!validRuleTypes.includes(data.ruleType)) {
    return {
      data: null,
      error: `ruleType deve ser um dos seguintes: ${validRuleTypes.join(", ")}.`,
    };
  }
  if (!data.studentAId) return { data: null, error: "studentAId é obrigatório." };
  if (data.priority !== undefined && (data.priority < 1 || data.priority > 10)) {
    return { data: null, error: "priority deve ser entre 1 e 10." };
  }

  return { data, error: null };
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Busca todas as regras de uma turma
 * @param {string} classId
 * @param {string} teacherId
 * @returns {Promise<{ data: Object[] | null, error: string | null }>}
 */
export async function getRules(classId, teacherId) {
  try {
    if (!classId || !teacherId) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherClass(classId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Turma não encontrada." };
    }

    const rules = await prisma.seatingRule.findMany({
      where: {
        classId,
      },
      include: {
        studentA: {
          select: { id: true, name: true },
        },
        studentB: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return { data: rules, error: null };
  } catch (error) {
    console.error("[Rule Actions] getRules error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Cria uma nova regra de posicionamento
 * @param {Object} data
 * @param {string} data.classId
 * @param {string} data.ruleType
 * @param {string} data.studentAId
 * @param {string|null} [data.studentBId]
 * @param {number} [data.priority=1]
 * @param {string} teacherId
 * @returns {Promise<{ data: Object | null, error: string | null }>}
 */
export async function createRule(data, teacherId) {
  try {
    if (!teacherId) {
      return { data: null, error: "ID do professor é obrigatório." };
    }

    // Validação
    const validation = validateRuleInput(data);
    if (validation.error) {
      return { data: null, error: validation.error };
    }

    const isOwner = await isTeacherClass(data.classId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Turma não encontrada." };
    }

    // Verifica que os alunos pertencem à turma
    const studentA = await prisma.student.findFirst({
      where: { id: data.studentAId, classId: data.classId, deletedAt: null },
    });
    if (!studentA) {
      return { data: null, error: "Aluno A não encontrado nesta turma." };
    }

    if (data.studentBId) {
      const studentB = await prisma.student.findFirst({
        where: { id: data.studentBId, classId: data.classId, deletedAt: null },
      });
      if (!studentB) {
        return { data: null, error: "Aluno B não encontrado nesta turma." };
      }

      // Evita regra de aluno com ele mesmo
      if (data.studentAId === data.studentBId) {
        return {
          data: null,
          error: "Não é possível criar regra entre um aluno e ele mesmo.",
        };
      }
    }

    const rule = await prisma.seatingRule.create({
      data: {
        classId: data.classId,
        ruleType: data.ruleType,
        studentAId: data.studentAId,
        studentBId: data.studentBId || null,
        priority: data.priority || 1,
        isActive: true,
      },
      include: {
        studentA: {
          select: { id: true, name: true },
        },
        studentB: {
          select: { id: true, name: true },
        },
      },
    });

    return { data: rule, error: null };
  } catch (error) {
    console.error("[Rule Actions] createRule error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Atualiza uma regra existente
 * @param {string} ruleId
 * @param {Object} data
 * @param {string} teacherId
 * @returns {Promise<{ data: Object | null, error: string | null }>}
 */
export async function updateRule(ruleId, data, teacherId) {
  try {
    if (!ruleId || !teacherId) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherRule(ruleId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Regra não encontrada." };
    }

    const existing = await prisma.seatingRule.findUnique({
      where: { id: ruleId },
    });

    if (!existing) {
      return { data: null, error: "Regra não encontrada." };
    }

    const updated = await prisma.seatingRule.update({
      where: { id: ruleId },
      data: {
        ruleType: data.ruleType !== undefined ? data.ruleType : existing.ruleType,
        studentAId: data.studentAId !== undefined ? data.studentAId : existing.studentAId,
        studentBId: data.studentBId !== undefined ? data.studentBId : existing.studentBId,
        priority: data.priority !== undefined ? data.priority : existing.priority,
      },
      include: {
        studentA: {
          select: { id: true, name: true },
        },
        studentB: {
          select: { id: true, name: true },
        },
      },
    });

    return { data: updated, error: null };
  } catch (error) {
    console.error("[Rule Actions] updateRule error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Deleta uma regra
 * @param {string} ruleId
 * @param {string} teacherId
 * @returns {Promise<{ data: boolean, error: string | null }>}
 */
export async function deleteRule(ruleId, teacherId) {
  try {
    if (!ruleId || !teacherId) {
      return { data: false, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherRule(ruleId, teacherId);
    if (!isOwner) {
      return { data: false, error: "Regra não encontrada." };
    }

    await prisma.seatingRule.delete({
      where: { id: ruleId },
    });

    return { data: true, error: null };
  } catch (error) {
    console.error("[Rule Actions] deleteRule error:", error);
    return { data: false, error: formatError(error) };
  }
}

/**
 * Ativa/desativa uma regra (toggle)
 * @param {string} ruleId
 * @param {string} teacherId
 * @returns {Promise<{ data: Object | null, error: string | null }>}
 */
export async function toggleRule(ruleId, teacherId) {
  try {
    if (!ruleId || !teacherId) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherRule(ruleId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Regra não encontrada." };
    }

    const rule = await prisma.seatingRule.findUnique({
      where: { id: ruleId },
    });

    if (!rule) {
      return { data: null, error: "Regra não encontrada." };
    }

    const updated = await prisma.seatingRule.update({
      where: { id: ruleId },
      data: { isActive: !rule.isActive },
      include: {
        studentA: {
          select: { id: true, name: true },
        },
        studentB: {
          select: { id: true, name: true },
        },
      },
    });

    return { data: updated, error: null };
  } catch (error) {
    console.error("[Rule Actions] toggleRule error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Busca regras ativas para uso no algoritmo
 * @param {string} classId
 * @param {string} teacherId
 * @returns {Promise<{ data: Object[] | null, error: string | null }>}
 */
export async function getActiveRules(classId, teacherId) {
  try {
    if (!classId || !teacherId) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherClass(classId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Turma não encontrada." };
    }

    const rules = await prisma.seatingRule.findMany({
      where: {
        classId,
        isActive: true,
      },
      orderBy: { priority: "desc" },
    });

    return { data: rules, error: null };
  } catch (error) {
    console.error("[Rule Actions] getActiveRules error:", error);
    return { data: null, error: formatError(error) };
  }
}
