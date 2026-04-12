/**
 * Server Actions — Onboarding do MAPI
 *
 * Todas as actions seguem o padrão:
 *   { data: T | null, error: string | null }
 *
 * Uso:
 *   import { completeOnboardingStep, getOnboardingProgress } from "@/lib/actions/onboarding-actions";
 *
 * Para os passos:
 *   import { ONBOARDING_STEPS } from "@/lib/actions/onboarding-steps";
 */

"use server";

import prisma from "@/lib/db/prisma";
import { ONBOARDING_STEPS } from "./onboarding-steps.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Busca dados de onboarding do professor
 * @param {string} teacherId
 * @returns {Promise<{ completedSteps: number[], percentage: number, allCompleted: boolean }>}
 */
export async function getOnboardingProgress(teacherId) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: {
        onboardingCompleted: true,
        onboardingSteps: true,
      },
    });

    if (!teacher) {
      return { completedSteps: [], percentage: 0, allCompleted: false };
    }

    const completedSteps = Array.isArray(teacher.onboardingSteps)
      ? teacher.onboardingSteps
      : [];

    const totalSteps = ONBOARDING_STEPS.length;
    const percentage = Math.round((completedSteps.length / totalSteps) * 100);
    const allCompleted = completedSteps.length === totalSteps;

    return { completedSteps, percentage, allCompleted };
  } catch (error) {
    console.error("[Onboarding] getOnboardingProgress error:", error);
    return { completedSteps: [], percentage: 0, allCompleted: false };
  }
}

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Completa um passo do onboarding
 * @param {string} teacherId
 * @param {number} step — 1 a 5
 * @returns {Promise<{ data: { completedSteps: number[], percentage: number, allCompleted: boolean } | null, error: string | null }>}
 */
export async function completeOnboardingStep(teacherId, step) {
  try {
    if (!teacherId || step < 1 || step > 5) {
      return { data: null, error: "Parâmetros inválidos." };
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { onboardingSteps: true },
    });

    if (!teacher) {
      return { data: null, error: "Professor não encontrado." };
    }

    const currentSteps = Array.isArray(teacher.onboardingSteps)
      ? teacher.onboardingSteps
      : [];

    // Adiciona passo se não existir
    if (!currentSteps.includes(step)) {
      const updatedSteps = [...currentSteps, step].sort((a, b) => a - b);

      await prisma.teacher.update({
        where: { id: teacherId },
        data: {
          onboardingSteps: updatedSteps,
          onboardingCompleted: updatedSteps.length === ONBOARDING_STEPS.length,
        },
      });

      const percentage = Math.round(
        (updatedSteps.length / ONBOARDING_STEPS.length) * 100
      );
      const allCompleted = updatedSteps.length === ONBOARDING_STEPS.length;

      return {
        data: {
          completedSteps: updatedSteps,
          percentage,
          allCompleted,
        },
        error: null,
      };
    }

    // Já completado
    const percentage = Math.round(
      (currentSteps.length / ONBOARDING_STEPS.length) * 100
    );

    return {
      data: {
        completedSteps: currentSteps,
        percentage,
        allCompleted: currentSteps.length === ONBOARDING_STEPS.length,
      },
      error: null,
    };
  } catch (error) {
    console.error("[Onboarding] completeOnboardingStep error:", error);
    return { data: null, error: "Erro ao completar passo." };
  }
}

/**
 * Verifica se o professor é novo (criado nas últimas 24h sem turmas)
 * @param {string} teacherId
 * @returns {Promise<{ data: boolean, error: string | null }>}
 */
export async function isNewTeacher(teacherId) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { createdAt: true },
    });

    if (!teacher) {
      return { data: false, error: null };
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const isNew = teacher.createdAt >= twentyFourHoursAgo;

    // Verifica se tem turmas
    const classCount = await prisma.class.count({
      where: { teacherId, deletedAt: null },
    });

    return { data: isNew && classCount === 0, error: null };
  } catch (error) {
    console.error("[Onboarding] isNewTeacher error:", error);
    return { data: false, error: null };
  }
}

/**
 * Marca tooltip como visto (avança para próximo passo)
 * @param {string} teacherId
 * @param {number} step — 1 a 4
 * @returns {Promise<{ data: { nextStep: number }, error: string | null }>}
 */
export async function markTooltipSeen(teacherId, step) {
  try {
    if (!teacherId || step < 1 || step > 4) {
      return { data: null, error: "Parâmetros inválidos." };
    }

    await prisma.teacher.update({
      where: { id: teacherId },
      data: { lastTooltipStep: step },
    });

    return { data: { nextStep: step + 1 }, error: null };
  } catch (error) {
    console.error("[Onboarding] markTooltipSeen error:", error);
    return { data: null, error: "Erro ao marcar tooltip." };
  }
}

/**
 * Pula todo o onboarding (não recomenda)
 * @param {string} teacherId
 * @returns {Promise<{ data: boolean, error: string | null }>}
 */
export async function skipOnboarding(teacherId) {
  try {
    if (!teacherId) {
      return { data: false, error: "ID do professor é obrigatório." };
    }

    await prisma.teacher.update({
      where: { id: teacherId },
      data: { onboardingCompleted: true },
    });

    return { data: true, error: null };
  } catch (error) {
    console.error("[Onboarding] skipOnboarding error:", error);
    return { data: false, error: "Erro ao pular onboarding." };
  }
}
