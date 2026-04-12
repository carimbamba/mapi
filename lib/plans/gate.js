/**
 * Gate de Verificação de Planos — MAPI
 *
 * Funções para verificar se um professor pode usar determinado recurso.
 * Todas retornam { allowed: boolean, reason?: string, feature?: string }.
 *
 * Uso:
 *   import { canUseAutoGenerate, canCreateLog } from "@/lib/plans/gate";
 *   const { allowed, reason } = canUseAutoGenerate(teacher);
 */

import { PLAN_LIMITS, getNumericLimit } from "./limits.js";
import prisma from "@/lib/db/prisma";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Busca o plano do professor pelo ID
 * @param {string} teacherId
 * @returns {Promise<string|null>}
 */
async function getTeacherPlanType(teacherId) {
  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    select: { planType: true },
  });
  return teacher?.planType || "FREE";
}

/**
 * Conta turmas ativas do professor
 * @param {string} teacherId
 * @returns {Promise<number>}
 */
async function countTeacherClasses(teacherId) {
  return prisma.class.count({
    where: { teacherId, deletedAt: null },
  });
}

// ─── Gate Functions ─────────────────────────────────────────────────────────

/**
 * Verifica se pode criar uma nova turma
 * @param {string} teacherId
 * @returns {Promise<{ allowed: boolean, reason?: string, feature?: string }>}
 */
export async function canCreateClass(teacherId) {
  const planType = await getTeacherPlanType(teacherId);
  const limits = PLAN_LIMITS[planType];

  if (limits.maxClasses === -1) {
    return { allowed: true };
  }

  const currentClasses = await countTeacherClasses(teacherId);
  const maxClasses = getNumericLimit(limits.maxClasses);

  if (currentClasses >= maxClasses) {
    return {
      allowed: false,
      reason: `Você atingiu o limite de ${maxClasses} turma${maxClasses > 1 ? "s" : ""}.`,
      feature: "maxClasses",
      currentUsage: currentClasses,
      maxAllowed: maxClasses,
      upgradeRequired: true,
    };
  }

  return { allowed: true };
}

/**
 * Verifica se pode usar geração automática de mapa
 * @param {string} teacherId
 * @returns {Promise<{ allowed: boolean, reason?: string, feature?: string }>}
 */
export async function canUseAutoGenerate(teacherId) {
  const planType = await getTeacherPlanType(teacherId);
  const limits = PLAN_LIMITS[planType];

  if (!limits.autoGenerate) {
    return {
      allowed: false,
      reason: "Geração automática de mapa está disponível apenas no plano Premium.",
      feature: "autoGenerate",
      upgradeRequired: true,
    };
  }

  return { allowed: true };
}

/**
 * Verifica se pode acessar perfis completos de acessibilidade
 * @param {string} teacherId
 * @returns {Promise<{ allowed: boolean, reason?: string, feature?: string }>}
 */
export async function canAccessFullProfile(teacherId) {
  const planType = await getTeacherPlanType(teacherId);
  const limits = PLAN_LIMITS[planType];

  if (limits.accessibilityProfiles !== "full") {
    return {
      allowed: false,
      reason: "Perfis completos de acessibilidade estão disponíveis apenas no plano Premium.",
      feature: "accessibilityProfiles",
      upgradeRequired: true,
    };
  }

  return { allowed: true };
}

/**
 * Verifica se pode criar entrada no Diário de Bordo
 * @param {string} teacherId
 * @returns {Promise<{ allowed: boolean, reason?: string, feature?: string }>}
 */
export async function canCreateLog(teacherId) {
  const planType = await getTeacherPlanType(teacherId);
  const limits = PLAN_LIMITS[planType];

  if (!limits.diaryLogs) {
    return {
      allowed: false,
      reason: "O Diário de Bordo está disponível apenas no plano Premium.",
      feature: "diaryLogs",
      upgradeRequired: true,
    };
  }

  return { allowed: true };
}

/**
 * Verifica se pode exportar em PDF
 * @param {string} teacherId
 * @returns {Promise<{ allowed: boolean, reason?: string, feature?: string }>}
 */
export async function canExportPDF(teacherId) {
  const planType = await getTeacherPlanType(teacherId);
  const limits = PLAN_LIMITS[planType];

  if (!limits.exportPDF) {
    return {
      allowed: false,
      reason: "Exportação em PDF está disponível apenas no plano Premium.",
      feature: "exportPDF",
      upgradeRequired: true,
    };
  }

  return { allowed: true };
}

/**
 * Verifica se pode acessar guias de manejo
 * @param {string} teacherId
 * @returns {Promise<{ allowed: boolean, reason?: string, feature?: string }>}
 */
export async function canAccessManagementGuides(teacherId) {
  const planType = await getTeacherPlanType(teacherId);
  const limits = PLAN_LIMITS[planType];

  if (!limits.managementGuides) {
    return {
      allowed: false,
      reason: "Guias de manejo estão disponíveis apenas no plano Premium.",
      feature: "managementGuides",
      upgradeRequired: true,
    };
  }

  return { allowed: true };
}

/**
 * Verifica se pode compartilhar com substituto
 * @param {string} teacherId
 * @returns {Promise<{ allowed: boolean, reason?: string, feature?: string }>}
 */
export async function canShareWithSubstitute(teacherId) {
  const planType = await getTeacherPlanType(teacherId);
  const limits = PLAN_LIMITS[planType];

  if (!limits.shareWithSubstitute) {
    return {
      allowed: false,
      reason: "Compartilhamento com substituto está disponível apenas no plano Premium.",
      feature: "shareWithSubstitute",
      upgradeRequired: true,
    };
  }

  return { allowed: true };
}

/**
 * Verifica se pode acessar coordenação
 * @param {string} teacherId
 * @returns {Promise<{ allowed: boolean, reason?: string, feature?: string }>}
 */
export async function canAccessCoordination(teacherId) {
  const planType = await getTeacherPlanType(teacherId);
  const limits = PLAN_LIMITS[planType];

  if (!limits.coordinationAccess) {
    return {
      allowed: false,
      reason: "Acesso da coordenação está disponível apenas no plano Escola.",
      feature: "coordinationAccess",
      upgradeRequired: true,
    };
  }

  return { allowed: true };
}

/**
 * Gate genérico — verifica qualquer feature do plano
 * @param {string} teacherId
 * @param {string} feature — chave de PLAN_LIMITS
 * @returns {Promise<{ allowed: boolean, reason?: string, feature?: string }>}
 */
export async function checkPlanFeature(teacherId, feature) {
  const planType = await getTeacherPlanType(teacherId);
  const limits = PLAN_LIMITS[planType];

  if (limits[feature] === undefined) {
    return {
      allowed: false,
      reason: `Feature "${feature}" não reconhecida.`,
      feature,
    };
  }

  const value = limits[feature];

  // Boolean feature
  if (typeof value === "boolean") {
    if (!value) {
      return {
        allowed: false,
        reason: `Este recurso está disponível apenas em planos superiores.`,
        feature,
        upgradeRequired: true,
      };
    }
    return { allowed: true };
  }

  // String level (basic/full)
  if (typeof value === "string") {
    if (value === "basic") {
      return {
        allowed: false,
        reason: `Versão avançada disponível apenas no plano Premium.`,
        feature,
        upgradeRequired: true,
      };
    }
    return { allowed: true };
  }

  // Numeric limit
  if (typeof value === "number") {
    if (value === -1) return { allowed: true };
    return { allowed: true, limit: value };
  }

  return { allowed: true };
}

/**
 * Retorna plano atual e próximo plano sugerido
 * @param {string} teacherId
 * @returns {Promise<{ currentPlan: string, nextPlan: string | null, canUpgrade: boolean }>}
 */
export async function getUpgradePath(teacherId) {
  const planType = await getTeacherPlanType(teacherId);

  const upgradePath = {
    FREE: { nextPlan: "PREMIUM", canUpgrade: true },
    PREMIUM: { nextPlan: "SCHOOL", canUpgrade: true },
    SCHOOL: { nextPlan: null, canUpgrade: false },
  };

  return {
    currentPlan: planType,
    ...upgradePath[planType],
  };
}
