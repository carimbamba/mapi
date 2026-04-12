/**
 * Server Actions — Mapa de Sala (Seating Map)
 *
 * Todas as ações seguem o padrão:
 *   { data: T | null, error: string | null }
 *
 * Multi-tenancy: todas as queries verificam teacherId.
 *
 * Uso:
 *   "use server";
 *   import { getSeatingMap, generateMap, saveAllPositions } from "@/lib/actions/seating-actions";
 */

"use server";

import prisma from "@/lib/db/prisma";
import { generateSeatingMap, createLayoutConfig } from "@/lib/algorithms/seating-generator";
import { canUseAutoGenerate } from "@/lib/plans/gate";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Verifica se o mapa pertence a uma turma do professor
 * @param {string} seatingMapId
 * @param {string} teacherId
 * @returns {Promise<boolean>}
 */
async function isTeacherMap(seatingMapId, teacherId) {
  const count = await prisma.seatingMap.count({
    where: {
      id: seatingMapId,
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
 * Rate limit simples (em memória) para geração de mapas
 * 10 gerações por hora por professor
 * @type {Map<string, number[]>}
 */
const generationLog = new Map();

function checkRateLimit(teacherId) {
  const now = Date.now();
  const oneHourAgo = now - 3600000;

  const timestamps = generationLog.get(teacherId) || [];
  const recent = timestamps.filter((t) => t > oneHourAgo);

  if (recent.length >= 10) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(recent[0] + 3600000),
    };
  }

  recent.push(now);
  generationLog.set(teacherId, recent);

  return {
    allowed: true,
    remaining: 10 - recent.length,
    resetAt: new Date(now + 3600000),
  };
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

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Busca o mapa ativo de uma turma com todas as posições
 * @param {string} classId
 * @param {string} teacherId
 * @returns {Promise<{ data: Object | null, error: string | null }>}
 */
export async function getSeatingMap(classId, teacherId) {
  try {
    if (!classId || !teacherId) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherClass(classId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Turma não encontrada." };
    }

    // Busca mapa ativo
    const activeMap = await prisma.seatingMap.findFirst({
      where: {
        classId,
        isActive: true,
      },
      include: {
        positions: {
          include: {
            student: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (!activeMap) {
      return { data: null, error: null }; // Sem mapa ainda
    }

    return { data: activeMap, error: null };
  } catch (error) {
    console.error("[Seating Actions] getSeatingMap error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Busca todos os mapas de uma turma
 * @param {string} classId
 * @param {string} teacherId
 * @returns {Promise<{ data: Object[] | null, error: string | null }>}
 */
export async function getAllMaps(classId, teacherId) {
  try {
    if (!classId || !teacherId) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherClass(classId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Turma não encontrada." };
    }

    const maps = await prisma.seatingMap.findMany({
      where: { classId },
      include: {
        positions: {
          include: { student: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { data: maps, error: null };
  } catch (error) {
    console.error("[Seating Actions] getAllMaps error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Cria um novo mapa vazio
 * @param {string} classId
 * @param {string} layoutType
 * @param {Object} layoutConfig
 * @param {string} teacherId
 * @returns {Promise<{ data: Object | null, error: string | null }>}
 */
export async function createSeatingMap(classId, layoutType, layoutConfig, teacherId) {
  try {
    if (!classId || !layoutType || !teacherId) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherClass(classId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Turma não encontrada." };
    }

    // Desativa mapas existentes
    await prisma.seatingMap.updateMany({
      where: { classId },
      data: { isActive: false },
    });

    const newMap = await prisma.seatingMap.create({
      data: {
        classId,
        name: `Mapa ${new Date().toLocaleDateString("pt-BR")}`,
        layoutType,
        layoutConfig,
        isActive: true,
      },
    });

    return { data: newMap, error: null };
  } catch (error) {
    console.error("[Seating Actions] createSeatingMap error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Atualiza posição de um aluno no mapa
 * @param {string} positionId
 * @param {number} x
 * @param {number} y
 * @param {string} deskId
 * @param {string} teacherId
 * @returns {Promise<{ data: Object | null, error: string | null }>}
 */
export async function updateStudentPosition(positionId, x, y, deskId, teacherId) {
  try {
    if (!positionId || teacherId === undefined) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    // Verifica que a posição pertence a um mapa do professor
    const position = await prisma.studentPosition.findUnique({
      where: { id: positionId },
      include: {
        seatingMap: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!position || position.seatingMap.class.teacherId !== teacherId) {
      return { data: null, error: "Posição não encontrada." };
    }

    const updated = await prisma.studentPosition.update({
      where: { id: positionId },
      data: {
        positionX: x,
        positionY: y,
        deskId,
      },
    });

    return { data: updated, error: null };
  } catch (error) {
    console.error("[Seating Actions] updateStudentPosition error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Salva todas as posições de um mapa em batch (upsert)
 * @param {string} seatingMapId
 * @param {Array<{studentId: string, positionX: number, positionY: number, deskId: string}>} positions
 * @param {string} teacherId
 * @returns {Promise<{ data: boolean, error: string | null }>}
 */
export async function saveAllPositions(seatingMapId, positions, teacherId) {
  try {
    if (!seatingMapId || !Array.isArray(positions) || teacherId === undefined) {
      return { data: false, error: "Parâmetros obrigatórios ausentes." };
    }

    // Verifica que o mapa pertence ao professor
    const isOwner = await isTeacherMap(seatingMapId, teacherId);
    if (!isOwner) {
      return { data: false, error: "Mapa não encontrado." };
    }

    // Delete todas as posições existentes
    await prisma.studentPosition.deleteMany({
      where: { seatingMapId },
    });

    // Insere novas posições em batch
    if (positions.length > 0) {
      await prisma.studentPosition.createMany({
        data: positions.map((p) => ({
          seatingMapId,
          studentId: p.studentId,
          positionX: p.positionX,
          positionY: p.positionY,
          deskId: p.deskId,
        })),
        skipDuplicates: true,
      });
    }

    return { data: true, error: null };
  } catch (error) {
    console.error("[Seating Actions] saveAllPositions error:", error);
    return { data: false, error: formatError(error) };
  }
}

/**
 * Limpa todas as posições de um mapa
 * @param {string} seatingMapId
 * @param {string} teacherId
 * @returns {Promise<{ data: boolean, error: string | null }>}
 */
export async function clearMap(seatingMapId, teacherId) {
  try {
    if (!seatingMapId || teacherId === undefined) {
      return { data: false, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherMap(seatingMapId, teacherId);
    if (!isOwner) {
      return { data: false, error: "Mapa não encontrado." };
    }

    await prisma.studentPosition.deleteMany({
      where: { seatingMapId },
    });

    return { data: true, error: null };
  } catch (error) {
    console.error("[Seating Actions] clearMap error:", error);
    return { data: false, error: formatError(error) };
  }
}

/**
 * Define um mapa como ativo
 * @param {string} seatingMapId
 * @param {string} classId
 * @param {string} teacherId
 * @returns {Promise<{ data: Object | null, error: string | null }>}
 */
export async function setActiveMap(seatingMapId, classId, teacherId) {
  try {
    if (!seatingMapId || !classId || teacherId === undefined) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherMap(seatingMapId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Mapa não encontrado." };
    }

    // Desativa outros mapas da turma
    await prisma.seatingMap.updateMany({
      where: { classId },
      data: { isActive: false },
    });

    // Ativa o mapa selecionado
    const updated = await prisma.seatingMap.update({
      where: { id: seatingMapId },
      data: { isActive: true },
    });

    return { data: updated, error: null };
  } catch (error) {
    console.error("[Seating Actions] setActiveMap error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Gera mapa automaticamente usando o algoritmo CSP
 * Aplica rate limit: 10 gerações/hora por professor
 *
 * @param {string} classId
 * @param {string} teacherId
 * @param {Object} [options]
 * @param {string} [options.layoutType]
 * @param {number} [options.rows]
 * @param {number} [options.cols]
 * @param {boolean} [options.prioritizeAccessibility]
 * @param {boolean} [options.separateTalkers]
 * @returns {Promise<{ data: Object | null, error: string | null }>}
 */
export async function generateMap(classId, teacherId, options = {}) {
  try {
    if (!classId || !teacherId) {
      return { data: null, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherClass(classId, teacherId);
    if (!isOwner) {
      return { data: null, error: "Turma não encontrada." };
    }

    // Rate limit
    const rateLimit = checkRateLimit(teacherId);
    if (!rateLimit.allowed) {
      return {
        data: null,
        error: `Limite de gerações excedido. Tente novamente após ${rateLimit.resetAt.toLocaleTimeString("pt-BR")}.`,
      };
    }

    // Verificação de plano (autoGenerate é feature Premium)
    const planCheck = await canUseAutoGenerate(teacherId);
    if (!planCheck.allowed) {
      return {
        data: null,
        error: "PLAN_LIMIT_EXCEEDED",
        feature: "autoGenerate",
        reason: planCheck.reason,
      };
    }

    // Busca alunos da turma
    const students = await prisma.student.findMany({
      where: {
        classId,
        deletedAt: null,
      },
    });

    if (students.length === 0) {
      return { data: null, error: "Nenhum aluno cadastrado nesta turma." };
    }

    // Busca regras da turma
    const rules = await prisma.seatingRule.findMany({
      where: {
        classId,
        isActive: true,
      },
    });

    // Configura layout
    const layoutType = options.layoutType || "rows";
    const rows = options.rows || 5;
    const cols = options.cols || 6;
    const layoutConfig = createLayoutConfig(layoutType, rows, cols);

    // Executa algoritmo
    const result = generateSeatingMap(
      students.map((s) => ({
        ...s,
        isDeaf: false,
        isBlind: false,
        hasReducedMobility: s.diagnosisType === "DISCALCULIA" ? false : false, // pode ser expandido
      })),
      layoutConfig,
      rules.map((r) => ({
        ...r,
        ruleType: r.ruleType,
      })),
      {
        prioritizeAccessibility: options.prioritizeAccessibility ?? true,
        separateTalkers: options.separateTalkers ?? false,
      }
    );

    // Salva o mapa gerado
    // Desativa mapas existentes
    await prisma.seatingMap.updateMany({
      where: { classId },
      data: { isActive: false },
    });

    const savedMap = await prisma.seatingMap.create({
      data: {
        classId,
        name: `Mapa Automático ${new Date().toLocaleDateString("pt-BR")} (${result.score}pts)`,
        layoutType,
        layoutConfig: {
          ...layoutConfig,
          desks: layoutConfig.desks,
          algorithm: "greedy-csp",
          score: result.score,
          warnings: result.warnings,
        },
        isActive: true,
        positions: {
          create: result.placements.map((p) => ({
            studentId: p.studentId,
            positionX: p.positionX,
            positionY: p.positionY,
            deskId: p.deskId,
          })),
        },
      },
      include: {
        positions: true,
      },
    });

    return {
      data: {
        map: savedMap,
        placements: result.placements,
        warnings: result.warnings,
        score: result.score,
        rateLimitRemaining: rateLimit.remaining,
      },
      error: null,
    };
  } catch (error) {
    console.error("[Seating Actions] generateMap error:", error);
    return { data: null, error: formatError(error) };
  }
}

/**
 * Deleta um mapa e suas posições
 * @param {string} seatingMapId
 * @param {string} teacherId
 * @returns {Promise<{ data: boolean, error: string | null }>}
 */
export async function deleteMap(seatingMapId, teacherId) {
  try {
    if (!seatingMapId || teacherId === undefined) {
      return { data: false, error: "Parâmetros obrigatórios ausentes." };
    }

    const isOwner = await isTeacherMap(seatingMapId, teacherId);
    if (!isOwner) {
      return { data: false, error: "Mapa não encontrado." };
    }

    // Deleta mapa (cascade deleta posições)
    await prisma.seatingMap.delete({
      where: { id: seatingMapId },
    });

    return { data: true, error: null };
  } catch (error) {
    console.error("[Seating Actions] deleteMap error:", error);
    return { data: false, error: formatError(error) };
  }
}
