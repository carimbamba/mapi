/**
 * Testes de Integração — Seating Actions + API Routes
 *
 * Simulam chamadas das Server Actions com mocks para não precisar de DB real.
 *
 * Executar: npx vitest run lib/actions/seating-actions.test.js
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock do Plan Gate ──────────────────────────────────────────────────────

vi.mock("@/lib/plans/gate", () => ({
  canUseAutoGenerate: vi.fn().mockResolvedValue({ allowed: true }),
}));

// ─── Mock do Prisma Client ─────────────────────────────────────────────────

// Mock do Prisma Client — DEVE usar o mesmo path que o source file
vi.mock("@/lib/db/prisma", () => {
  const mockPrisma = {
    class: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    student: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    seatingMap: {
      count: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    studentPosition: {
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    seatingRule: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    teacher: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(async (ops) => {
      const results = [];
      for (const op of ops) {
        if (typeof op === "function") {
          results.push(await op(mockPrisma));
        } else {
          results.push(await op);
        }
      }
      return results;
    }),
  };

  return { default: mockPrisma };
});

import prisma from "@/lib/db/prisma";
import {
  getSeatingMap,
  createSeatingMap,
  saveAllPositions,
  clearMap,
  setActiveMap,
  generateMap,
  deleteMap,
} from "@/lib/actions/seating-actions";

const TEACHER_ID = "teacher-123";
const CLASS_ID = "class-456";
const MAP_ID = "map-789";

function resetMocks() {
  vi.clearAllMocks();

  // Defaults
  prisma.class.count.mockResolvedValue(1);
  prisma.seatingMap.count.mockResolvedValue(1);
  prisma.seatingMap.findFirst.mockResolvedValue(null);
  prisma.seatingMap.findMany.mockResolvedValue([]);
  prisma.seatingMap.create.mockResolvedValue({ id: MAP_ID, classId: CLASS_ID });
  prisma.seatingMap.update.mockResolvedValue({ id: MAP_ID });
  prisma.seatingMap.updateMany.mockResolvedValue({ count: 0 });
  prisma.studentPosition.deleteMany.mockResolvedValue({ count: 0 });
  prisma.studentPosition.createMany.mockResolvedValue({ count: 0 });
}

// ═════════════════════════════════════════════════════════════════════════════
// Testes de Integração — Seating Actions
// ═════════════════════════════════════════════════════════════════════════════

describe("Seating Actions — Integração", () => {
  beforeEach(resetMocks);

  // ── Multi-tenancy ─────────────────────────────────────────────────────
  describe("Multi-tenancy", () => {
    it("Professor não acessa mapa de turma de outro professor", async () => {
      prisma.class.count.mockResolvedValue(0); // Not owner

      const result = await getSeatingMap(CLASS_ID, "teacher-wrong");

      expect(result.data).toBeNull();
      expect(result.error).toContain("Turma não encontrada");
    });

    it("Professor não cria mapa em turma de outro professor", async () => {
      prisma.class.count.mockResolvedValue(0);

      const result = await createSeatingMap(
        CLASS_ID,
        "rows",
        {},
        "teacher-wrong"
      );

      expect(result.data).toBeNull();
      expect(result.error).toContain("Turma não encontrada");
    });

    it("Professor não salva posições em mapa de outro professor", async () => {
      prisma.seatingMap.count.mockResolvedValue(0);

      const result = await saveAllPositions(
        MAP_ID,
        [],
        "teacher-wrong"
      );

      expect(result.data).toBe(false);
      expect(result.error).toContain("Mapa não encontrado");
    });

    it("Professor não deleta mapa de outro professor", async () => {
      prisma.seatingMap.count.mockResolvedValue(0);

      const result = await deleteMap(MAP_ID, "teacher-wrong");

      expect(result.data).toBe(false);
      expect(result.error).toContain("Mapa não encontrado");
    });
  });

  // ── CRUD ──────────────────────────────────────────────────────────────
  describe("CRUD de Mapas", () => {
    it("getSeatingMap retorna mapa ativo com posições", async () => {
      const mockMap = {
        id: MAP_ID,
        classId: CLASS_ID,
        layoutType: "rows",
        isActive: true,
        positions: [
          { studentId: "s1", deskId: "R1-C1", positionX: 0, positionY: 0 },
        ],
      };

      prisma.seatingMap.findFirst.mockResolvedValue(mockMap);

      const result = await getSeatingMap(CLASS_ID, TEACHER_ID);

      expect(result.data).toEqual(mockMap);
      expect(result.error).toBeNull();
    });

    it("getSeatingMap retorna null quando não há mapa ativo", async () => {
      prisma.seatingMap.findFirst.mockResolvedValue(null);

      const result = await getSeatingMap(CLASS_ID, TEACHER_ID);

      expect(result.data).toBeNull();
      expect(result.error).toBeNull(); // Sem mapa = não é erro
    });

    it("createSeatingMap desativa mapas existentes e cria novo", async () => {
      prisma.seatingMap.create.mockResolvedValue({
        id: MAP_ID,
        classId: CLASS_ID,
        layoutType: "rows",
        isActive: true,
      });

      const result = await createSeatingMap(
        CLASS_ID,
        "rows",
        { type: "rows", rows: 5, cols: 6 },
        TEACHER_ID
      );

      expect(prisma.seatingMap.updateMany).toHaveBeenCalledWith({
        where: { classId: CLASS_ID },
        data: { isActive: false },
      });

      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });

    it("clearMap deleta todas as posições", async () => {
      prisma.seatingMap.count.mockResolvedValue(1);

      const result = await clearMap(MAP_ID, TEACHER_ID);

      expect(prisma.studentPosition.deleteMany).toHaveBeenCalledWith({
        where: { seatingMapId: MAP_ID },
      });

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
    });

    it("setActiveMap ativa o mapa e desativa os outros", async () => {
      prisma.seatingMap.count.mockResolvedValue(1);
      prisma.seatingMap.update.mockResolvedValue({ id: MAP_ID, isActive: true });

      const result = await setActiveMap(MAP_ID, CLASS_ID, TEACHER_ID);

      // Desativa outros
      expect(prisma.seatingMap.updateMany).toHaveBeenCalledWith({
        where: { classId: CLASS_ID },
        data: { isActive: false },
      });

      // Ativa o selecionado
      expect(prisma.seatingMap.update).toHaveBeenCalledWith({
        where: { id: MAP_ID },
        data: { isActive: true },
      });

      expect(result.data).toBeDefined();
    });
  });

  // ── Save Positions ────────────────────────────────────────────────────
  describe("Save All Positions", () => {
    it("Deleta posições antigas e insere novas em batch", async () => {
      prisma.seatingMap.count.mockResolvedValue(1);

      const positions = [
        { studentId: "s1", positionX: 0, positionY: 0, deskId: "R1-C1" },
        { studentId: "s2", positionX: 80, positionY: 0, deskId: "R1-C2" },
        { studentId: "s3", positionX: 0, positionY: 60, deskId: "R2-C1" },
      ];

      const result = await saveAllPositions(MAP_ID, positions, TEACHER_ID);

      expect(prisma.studentPosition.deleteMany).toHaveBeenCalledWith({
        where: { seatingMapId: MAP_ID },
      });

      expect(prisma.studentPosition.createMany).toHaveBeenCalledWith({
        data: positions.map((p) => ({
          seatingMapId: MAP_ID,
          studentId: p.studentId,
          positionX: p.positionX,
          positionY: p.positionY,
          deskId: p.deskId,
        })),
        skipDuplicates: true,
      });

      expect(result.data).toBe(true);
    });

    it("Lista vazia: apenas deleta posições existentes", async () => {
      prisma.seatingMap.count.mockResolvedValue(1);

      const result = await saveAllPositions(MAP_ID, [], TEACHER_ID);

      expect(prisma.studentPosition.deleteMany).toHaveBeenCalled();
      expect(prisma.studentPosition.createMany).not.toHaveBeenCalled();

      expect(result.data).toBe(true);
    });
  });

  // ── Generate Map ──────────────────────────────────────────────────────
  describe("Generate Map", () => {
    it("Gera mapa e salva automaticamente", async () => {
      // Setup: 5 alunos na turma
      prisma.student.findMany.mockResolvedValue([
        { id: "s1", name: "João", hasAccessibilityNeeds: false },
        { id: "s2", name: "Maria", hasAccessibilityNeeds: true, diagnosisType: "TEA" },
        { id: "s3", name: "Pedro", hasAccessibilityNeeds: true, diagnosisType: "TDAH" },
        { id: "s4", name: "Ana", hasAccessibilityNeeds: false },
        { id: "s5", name: "Carlos", hasAccessibilityNeeds: false },
      ]);

      prisma.seatingRule.findMany.mockResolvedValue([]);
      prisma.seatingMap.create.mockResolvedValue({
        id: MAP_ID,
        classId: CLASS_ID,
        layoutType: "rows",
        isActive: true,
        positions: [
          { studentId: "s2", deskId: "R1-C1", positionX: 0, positionY: 0 },
          { studentId: "s3", deskId: "R1-C2", positionX: 80, positionY: 0 },
        ],
      });

      const result = await generateMap(CLASS_ID, TEACHER_ID, {
        layoutType: "rows",
        rows: 3,
        cols: 3,
      });

      expect(result.data).toBeDefined();
      expect(result.data.map).toBeDefined();
      expect(result.data.score).toBeGreaterThanOrEqual(0);
      expect(result.data.score).toBeLessThanOrEqual(100);
      expect(result.error).toBeNull();

      // Verifica que salvou
      expect(prisma.seatingMap.updateMany).toHaveBeenCalled();
      expect(prisma.seatingMap.create).toHaveBeenCalled();
    });

    it("Retorna erro quando não há alunos", async () => {
      prisma.student.findMany.mockResolvedValue([]);

      const result = await generateMap(CLASS_ID, TEACHER_ID);

      expect(result.data).toBeNull();
      expect(result.error).toContain("Nenhum aluno");
    });
  });

  // ── Rate Limit ────────────────────────────────────────────────────────
  describe("Rate Limit", () => {
    it("11ª geração retorna erro de rate limit", async () => {
      // Simula 10 gerações anteriores
      for (let i = 0; i < 10; i++) {
        await generateMap(CLASS_ID, TEACHER_ID);
      }

      // 11ª chamada deve falhar
      const result = await generateMap(CLASS_ID, TEACHER_ID);

      expect(result.data).toBeNull();
      expect(result.error).toContain("Limite de gerações");
    });
  });

  // ── Validação de Inputs ───────────────────────────────────────────────
  describe("Validação de Inputs", () => {
    it("getSeatingMap sem classId retorna erro", async () => {
      const result = await getSeatingMap("", TEACHER_ID);

      expect(result.data).toBeNull();
      expect(result.error).toContain("obrigatórios");
    });

    it("createSeatingMap sem layoutType retorna erro", async () => {
      const result = await createSeatingMap(CLASS_ID, "", {}, TEACHER_ID);

      expect(result.data).toBeNull();
      expect(result.error).toContain("obrigatórios");
    });

    it("saveAllPositions com seatingMapId vazio retorna erro", async () => {
      const result = await saveAllPositions("", [], TEACHER_ID);

      expect(result.data).toBe(false);
      expect(result.error).toContain("obrigatórios");
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Testes de Integração — Rule Actions
// ═════════════════════════════════════════════════════════════════════════════

describe("Rule Actions — Integração", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prisma.class.count.mockResolvedValue(1);
    prisma.seatingRule.count.mockResolvedValue(1);
    prisma.seatingRule.findUnique.mockResolvedValue(null);
    prisma.seatingRule.findMany.mockResolvedValue([]);
    prisma.student.findFirst.mockResolvedValue({ id: "s1", name: "João" });

    prisma.seatingRule.create.mockResolvedValue({
      id: "rule-1",
      classId: CLASS_ID,
      ruleType: "KEEP_APART",
      studentAId: "s1",
      studentBId: "s2",
      priority: 10,
      isActive: true,
    });

    prisma.seatingRule.update.mockResolvedValue({
      id: "rule-1",
      isActive: false,
    });
  });

  it("createRule com alunos da mesma turma", async () => {
    const { createRule } = await import("@/lib/actions/rule-actions");

    const result = await createRule(
      {
        classId: CLASS_ID,
        ruleType: "KEEP_APART",
        studentAId: "s1",
        studentBId: "s2",
        priority: 10,
      },
      TEACHER_ID
    );

    expect(result.data).toBeDefined();
    expect(result.data.ruleType).toBe("KEEP_APART");
    expect(result.error).toBeNull();
  });

  it("createRule rejeita aluno que não está na turma", async () => {
    prisma.student.findFirst.mockResolvedValue(null);

    const { createRule } = await import("@/lib/actions/rule-actions");

    const result = await createRule(
      {
        classId: CLASS_ID,
        ruleType: "KEEP_APART",
        studentAId: "s-wrong",
        studentBId: "s2",
        priority: 10,
      },
      TEACHER_ID
    );

    expect(result.data).toBeNull();
    expect(result.error).toContain("não encontrado");
  });

  it("createRule rejeita regra de aluno com ele mesmo", async () => {
    const { createRule } = await import("@/lib/actions/rule-actions");

    const result = await createRule(
      {
        classId: CLASS_ID,
        ruleType: "KEEP_APART",
        studentAId: "s1",
        studentBId: "s1", // mesmo aluno!
        priority: 10,
      },
      TEACHER_ID
    );

    expect(result.data).toBeNull();
    expect(result.error).toContain("ele mesmo");
  });

  it("toggleRule inverte estado de ativo/inativo", async () => {
    prisma.seatingRule.findUnique.mockResolvedValue({
      id: "rule-1",
      isActive: true,
    });

    prisma.seatingRule.count.mockResolvedValue(1);
    prisma.seatingRule.update.mockResolvedValue({
      id: "rule-1",
      isActive: false,
    });

    const { toggleRule } = await import("@/lib/actions/rule-actions");

    const result = await toggleRule("rule-1", TEACHER_ID);

    expect(result.data).toBeDefined();
    expect(result.data.isActive).toBe(false);
  });

  it("deleteRule remove a regra", async () => {
    prisma.seatingRule.count.mockResolvedValue(1);

    const { deleteRule } = await import("@/lib/actions/rule-actions");

    const result = await deleteRule("rule-1", TEACHER_ID);

    expect(prisma.seatingRule.delete).toHaveBeenCalledWith({
      where: { id: "rule-1" },
    });

    expect(result.data).toBe(true);
  });

  it("createRule rejeita regra de turma de outro professor", async () => {
    prisma.class.count.mockResolvedValue(0);

    const { createRule } = await import("@/lib/actions/rule-actions");

    const result = await createRule(
      {
        classId: CLASS_ID,
        ruleType: "KEEP_APART",
        studentAId: "s1",
        studentBId: "s2",
        priority: 10,
      },
      "teacher-wrong"
    );

    expect(result.data).toBeNull();
    expect(result.error).toContain("Turma não encontrada");
  });
});
