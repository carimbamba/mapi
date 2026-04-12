/**
 * Definições de Planos e Limites — MAPI
 *
 * Configuração centralizada de features e limites por plano.
 * Usado pelo gate.ts para verificar permissões.
 *
 * Uso:
 *   import { PLAN_LIMITS, PLAN_NAMES, PLAN_PRICES } from "@/lib/plans/limits";
 *   const limits = PLAN_LIMITS[teacher.planType];
 */

// ─── Tipos de Plano ─────────────────────────────────────────────────────────

/**
 * @typedef {'FREE'|'PREMIUM'|'SCHOOL'} PlanType
 */

// ─── Nomes exibidos ─────────────────────────────────────────────────────────

export const PLAN_NAMES = {
  FREE: "Gratuito",
  PREMIUM: "Premium",
  SCHOOL: "Escola",
};

// ─── Preços ─────────────────────────────────────────────────────────────────

export const PLAN_PRICES = {
  FREE: { amount: 0, currency: "BRL", display: "Grátis", period: null },
  PREMIUM: {
    amount: 19.9,
    currency: "BRL",
    display: "R$ 19,90",
    period: "/mês",
  },
  SCHOOL: { amount: 149, currency: "BRL", display: "R$ 149", period: "/mês" },
};

// ─── Limites e Features por Plano ───────────────────────────────────────────

/**
 * @typedef {Object} PlanLimits
 * @property {number} maxClasses — máximo de turmas (-1 = ilimitado)
 * @property {number} maxStudentsPerClass — máximo de alunos por turma (-1 = ilimitado)
 * @property {boolean} autoGenerate — geração automática de mapa por IA
 * @property {'basic'|'full'} accessibilityProfiles — nível de perfis de acessibilidade
 * @property {boolean} diaryLogs — Diário de Bordo
 * @property {boolean} exportPDF — exportação em PDF
 * @property {boolean} managementGuides — guias de manejo completos
 * @property {boolean} shareWithSubstitute — compartilhar com substituto
 * @property {boolean} coordinationAccess — acesso da coordenação
 * @property {boolean} prioritySupport — suporte prioritário
 */

/** @type {Record<PlanType, PlanLimits>} */
export const PLAN_LIMITS = {
  FREE: {
    maxClasses: 2,
    maxStudentsPerClass: 40,
    autoGenerate: false,
    accessibilityProfiles: "basic",
    diaryLogs: false,
    exportPDF: false,
    managementGuides: false,
    shareWithSubstitute: false,
    coordinationAccess: false,
    prioritySupport: false,
  },

  PREMIUM: {
    maxClasses: -1, // ilimitado
    maxStudentsPerClass: -1,
    autoGenerate: true,
    accessibilityProfiles: "full",
    diaryLogs: true,
    exportPDF: true,
    managementGuides: true,
    shareWithSubstitute: true,
    coordinationAccess: false,
    prioritySupport: true,
  },

  SCHOOL: {
    maxClasses: -1,
    maxStudentsPerClass: -1,
    autoGenerate: true,
    accessibilityProfiles: "full",
    diaryLogs: true,
    exportPDF: true,
    managementGuides: true,
    shareWithSubstitute: true,
    coordinationAccess: true,
    prioritySupport: true,
  },
};

// ─── Features Labels ────────────────────────────────────────────────────────

/**
 * Labels e descrições de features para uso na UI
 */
export const FEATURE_LABELS = {
  autoGenerate: {
    name: "Geração automática por IA",
    description: "Posicione alunos automaticamente com algoritmo inteligente",
    icon: "WandSparkles",
  },
  diaryLogs: {
    name: "Diário de Bordo",
    description: "Registre comportamentos e progressos dos alunos",
    icon: "ScrollText",
  },
  exportPDF: {
    name: "Exportação PDF",
    description: "Exporte mapas e relatórios em PDF",
    icon: "Download",
  },
  managementGuides: {
    name: "Guias de Manejo",
    description: "Orientações práticas para cada condição",
    icon: "BookOpen",
  },
  shareWithSubstitute: {
    name: "Compartilhar com Substituto",
    description: "Envie mapas e informações para professores substitutos",
    icon: "Share2",
  },
  coordinationAccess: {
    name: "Acesso da Coordenação",
    description: "Coordenadores podem acompanhar turmas e diários",
    icon: "Users",
  },
  prioritySupport: {
    name: "Suporte Prioritário",
    description: "Atendimento dedicado e resposta rápida",
    icon: "Headphones",
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Verifica se um plano é superior a outro
 * @param {PlanType} planA
 * @param {PlanType} planB
 * @returns {boolean} — true se planA > planB
 */
export function isPlanHigher(planA, planB) {
  const order = { FREE: 0, PREMIUM: 1, SCHOOL: 2 };
  return (order[planA] || 0) > (order[planB] || 0);
}

/**
 * Retorna o limite numérico (converte -1 para Infinity)
 * @param {number} limit
 * @returns {number}
 */
export function getNumericLimit(limit) {
  return limit === -1 ? Infinity : limit;
}
