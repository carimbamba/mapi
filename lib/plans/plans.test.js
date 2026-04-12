/**
 * Testes de Planos e Limites — MAPI
 *
 * Verifica que os limites do plano FREE são aplicados corretamente
 * e que PREMIUM/SCHOOL têm acesso irrestrito.
 *
 * Executar: npx vitest run lib/plans/plans.test.js
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock do Prisma ────────────────────────────────────────────────────────

vi.mock("@/lib/db/prisma", () => {
  const mockClassCount = { free: 0, premium: 0 };

  const mockPrisma = {
    teacher: {
      findUnique: vi.fn().mockImplementation(({ where }) => {
        if (where.id === "free-teacher") {
          return Promise.resolve({ id: "free-teacher", planType: "FREE" });
        }
        if (where.id === "premium-teacher") {
          return Promise.resolve({ id: "premium-teacher", planType: "PREMIUM" });
        }
        if (where.id === "school-teacher") {
          return Promise.resolve({ id: "school-teacher", planType: "SCHOOL" });
        }
        return Promise.resolve(null);
      }),
    },
    class: {
      count: vi.fn().mockImplementation(({ where }) => {
        return Promise.resolve(mockClassCount[where.teacherId === "free-teacher" ? "free" : "premium"] || 0);
      }),
      create: vi.fn().mockImplementation((data) => {
        return Promise.resolve({ id: "new-class", ...data.data });
      }),
    },
  };

  // Helper para ajustar contagem de turmas nos testes
  mockPrisma._setClassCount = (teacherKey, count) => {
    mockClassCount[teacherKey] = count;
  };

  return { default: mockPrisma };
});

import prisma from "@/lib/db/prisma";
import {
  canCreateClass,
  canUseAutoGenerate,
  canAccessFullProfile,
  canCreateLog,
  canExportPDF,
  canAccessManagementGuides,
  canShareWithSubstitute,
  canAccessCoordination,
  checkPlanFeature,
  getUpgradePath,
} from "@/lib/plans/gate";
import { isPlanHigher, getNumericLimit, PLAN_LIMITS } from "@/lib/plans/limits";

// ─── Helper ────────────────────────────────────────────────────────────────

function setClassCount(teacherId, count) {
  const key = teacherId.includes("free") ? "free" : "premium";
  prisma._setClassCount(key, count);
}

// ─── Testes ────────────────────────────────────────────────────────────────

describe("Limites do plano FREE", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setClassCount("free-teacher", 0);
    setClassCount("premium-teacher", 0);
  });

  it("Professor FREE não pode criar 3ª turma (já tem 2)", async () => {
    setClassCount("free-teacher", 2);

    const result = await canCreateClass("free-teacher");

    expect(result.allowed).toBe(false);
    expect(result.feature).toBe("maxClasses");
    expect(result.currentUsage).toBe(2);
    expect(result.maxAllowed).toBe(2);
    expect(result.upgradeRequired).toBe(true);
    expect(result.reason).toContain("2 turmas");
  });

  it("Professor FREE pode criar 2ª turma (já tem 1)", async () => {
    setClassCount("free-teacher", 1);

    const result = await canCreateClass("free-teacher");

    expect(result.allowed).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("Professor FREE pode criar 1ª turma (0 existentes)", async () => {
    setClassCount("free-teacher", 0);

    const result = await canCreateClass("free-teacher");

    expect(result.allowed).toBe(true);
  });

  it("Professor PREMIUM pode criar 10 turmas", async () => {
    for (let i = 0; i < 10; i++) {
      setClassCount("premium-teacher", i);
      const result = await canCreateClass("premium-teacher");
      expect(result.allowed).toBe(true);
    }
  });

  it("Professor SCHOOL pode criar turmas ilimitadas", async () => {
    const result = await canCreateClass("school-teacher");
    expect(result.allowed).toBe(true);
  });
});

describe("Geração automática — bloqueio FREE", () => {
  it("generateMap bloqueado para FREE com mensagem correta", async () => {
    const result = await canUseAutoGenerate("free-teacher");

    expect(result.allowed).toBe(false);
    expect(result.feature).toBe("autoGenerate");
    expect(result.upgradeRequired).toBe(true);
    expect(result.reason).toContain("Premium");
  });

  it("Geração automática liberada para PREMIUM", async () => {
    const result = await canUseAutoGenerate("premium-teacher");

    expect(result.allowed).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("Geração automática liberada para SCHOOL", async () => {
    const result = await canUseAutoGenerate("school-teacher");

    expect(result.allowed).toBe(true);
  });
});

describe("Retorno de erro padronizado", () => {
  it("canCreateClass retorna estrutura completa quando bloqueado", async () => {
    setClassCount("free-teacher", 2);

    const result = await canCreateClass("free-teacher");

    expect(result).toHaveProperty("allowed", false);
    expect(result).toHaveProperty("reason");
    expect(result).toHaveProperty("feature", "maxClasses");
    expect(result).toHaveProperty("currentUsage", 2);
    expect(result).toHaveProperty("maxAllowed", 2);
    expect(result).toHaveProperty("upgradeRequired", true);
  });

  it("canUseAutoGenerate retorna estrutura quando bloqueado", async () => {
    const result = await canUseAutoGenerate("free-teacher");

    expect(result).toHaveProperty("allowed", false);
    expect(result).toHaveProperty("reason");
    expect(result).toHaveProperty("feature", "autoGenerate");
    expect(result).toHaveProperty("upgradeRequired", true);
  });
});

describe("Gates de features Premium — FREE vs PREMIUM", () => {
  it("canAccessFullProfile bloqueado para FREE", async () => {
    const result = await canAccessFullProfile("free-teacher");
    expect(result.allowed).toBe(false);
    expect(result.feature).toBe("accessibilityProfiles");
  });

  it("canAccessFullProfile liberado para PREMIUM", async () => {
    const result = await canAccessFullProfile("premium-teacher");
    expect(result.allowed).toBe(true);
  });

  it("canCreateLog bloqueado para FREE", async () => {
    const result = await canCreateLog("free-teacher");
    expect(result.allowed).toBe(false);
    expect(result.feature).toBe("diaryLogs");
  });

  it("canCreateLog liberado para PREMIUM", async () => {
    const result = await canCreateLog("premium-teacher");
    expect(result.allowed).toBe(true);
  });

  it("canExportPDF bloqueado para FREE", async () => {
    const result = await canExportPDF("free-teacher");
    expect(result.allowed).toBe(false);
    expect(result.feature).toBe("exportPDF");
  });

  it("canExportPDF liberado para PREMIUM", async () => {
    const result = await canExportPDF("premium-teacher");
    expect(result.allowed).toBe(true);
  });

  it("canAccessManagementGuides bloqueado para FREE", async () => {
    const result = await canAccessManagementGuides("free-teacher");
    expect(result.allowed).toBe(false);
    expect(result.feature).toBe("managementGuides");
  });

  it("canAccessManagementGuides liberado para SCHOOL", async () => {
    const result = await canAccessManagementGuides("school-teacher");
    expect(result.allowed).toBe(true);
  });

  it("canShareWithSubstitute bloqueado para FREE", async () => {
    const result = await canShareWithSubstitute("free-teacher");
    expect(result.allowed).toBe(false);
    expect(result.feature).toBe("shareWithSubstitute");
  });

  it("canShareWithSubstitute liberado para PREMIUM", async () => {
    const result = await canShareWithSubstitute("premium-teacher");
    expect(result.allowed).toBe(true);
  });

  it("canAccessCoordination bloqueado para FREE e PREMIUM", async () => {
    const freeResult = await canAccessCoordination("free-teacher");
    expect(freeResult.allowed).toBe(false);

    const premiumResult = await canAccessCoordination("premium-teacher");
    expect(premiumResult.allowed).toBe(false);

    const schoolResult = await canAccessCoordination("school-teacher");
    expect(schoolResult.allowed).toBe(true);
  });
});

describe("checkPlanFeature — gate genérico", () => {
  it("retorna false para feature inexistente", async () => {
    const result = await checkPlanFeature("free-teacher", "featureInexistente");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("não reconhecida");
  });

  it("retorna true para boolean feature = true", async () => {
    // autoGenerate é true para PREMIUM
    const result = await checkPlanFeature("premium-teacher", "autoGenerate");
    expect(result.allowed).toBe(true);
  });

  it("retorna false para boolean feature = false", async () => {
    // autoGenerate é false para FREE
    const result = await checkPlanFeature("free-teacher", "autoGenerate");
    expect(result.allowed).toBe(false);
    expect(result.upgradeRequired).toBe(true);
  });

  it("retorna false para string level = basic", async () => {
    // accessibilityProfiles é "basic" para FREE
    const result = await checkPlanFeature("free-teacher", "accessibilityProfiles");
    expect(result.allowed).toBe(false);
    expect(result.upgradeRequired).toBe(true);
  });

  it("retorna true para string level = full", async () => {
    // accessibilityProfiles é "full" para PREMIUM
    const result = await checkPlanFeature("premium-teacher", "accessibilityProfiles");
    expect(result.allowed).toBe(true);
  });

  it("retorna true para numeric = -1 (ilimitado)", async () => {
    // maxClasses é -1 (ilimitado) para PREMIUM
    const result = await checkPlanFeature("premium-teacher", "maxClasses");
    expect(result.allowed).toBe(true);
  });

  it("retorna true com limit para numeric > 0 (FREE)", async () => {
    // maxClasses é 2 para FREE
    const result = await checkPlanFeature("free-teacher", "maxClasses");
    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(2);
  });
});

describe("getUpgradePath — caminho de upgrade", () => {
  it("FREE → PREMIUM", async () => {
    const result = await getUpgradePath("free-teacher");
    expect(result.currentPlan).toBe("FREE");
    expect(result.nextPlan).toBe("PREMIUM");
    expect(result.canUpgrade).toBe(true);
  });

  it("PREMIUM → SCHOOL", async () => {
    const result = await getUpgradePath("premium-teacher");
    expect(result.currentPlan).toBe("PREMIUM");
    expect(result.nextPlan).toBe("SCHOOL");
    expect(result.canUpgrade).toBe(true);
  });

  it("SCHOOL → null (sem upgrade)", async () => {
    const result = await getUpgradePath("school-teacher");
    expect(result.currentPlan).toBe("SCHOOL");
    expect(result.nextPlan).toBeNull();
    expect(result.canUpgrade).toBe(false);
  });
});

describe("Helpers — isPlanHigher e getNumericLimit", () => {
  it("isPlanHigher: PREMIUM > FREE", () => {
    expect(isPlanHigher("PREMIUM", "FREE")).toBe(true);
  });

  it("isPlanHigher: SCHOOL > PREMIUM", () => {
    expect(isPlanHigher("SCHOOL", "PREMIUM")).toBe(true);
  });

  it("isPlanHigher: FREE não > PREMIUM", () => {
    expect(isPlanHigher("FREE", "PREMIUM")).toBe(false);
  });

  it("isPlanHigher: mesmo plano = false", () => {
    expect(isPlanHigher("FREE", "FREE")).toBe(false);
  });

  it("getNumericLimit: -1 → Infinity", () => {
    expect(getNumericLimit(-1)).toBe(Infinity);
  });

  it("getNumericLimit: 2 → 2", () => {
    expect(getNumericLimit(2)).toBe(2);
  });

  it("getNumericLimit: 40 → 40", () => {
    expect(getNumericLimit(40)).toBe(40);
  });
});
