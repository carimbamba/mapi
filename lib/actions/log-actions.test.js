/**
 * Testes de LGPD e Privacidade — Log Actions
 *
 * Mock do Prisma para testar lógica de negócio sem banco real.
 *
 * Executar: npx vitest run lib/actions/log-actions.test.js
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock do Prisma ─────────────────────────────────────────────────────────

vi.mock("@/lib/plans/gate", () => ({
  canCreateLog: vi.fn().mockResolvedValue({ allowed: true }),
  canExportPDF: vi.fn().mockResolvedValue({ allowed: true }),
}));

vi.mock("@/lib/db/prisma", () => {
  const mockPrisma = {
    student: {
      count: vi.fn(),
      findFirst: vi.fn(),
    },
    accessibilityLog: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  return { default: mockPrisma };
});

import prisma from "@/lib/db/prisma";
import {
  createLog,
  getLogs,
  getLogsFiltered,
  updateLog,
  deleteLog,
  countLogs,
  getLastLog,
} from "@/lib/actions/log-actions";

const TEACHER_A = "teacher-a";
const TEACHER_B = "teacher-b";
const STUDENT_1 = "student-1";
const STUDENT_2 = "student-2";

function resetMocks() {
  vi.clearAllMocks();
  prisma.student.count.mockResolvedValue(1);
  prisma.student.findFirst.mockResolvedValue({ id: STUDENT_1 });
  prisma.accessibilityLog.count.mockResolvedValue(1);
  prisma.accessibilityLog.findMany.mockResolvedValue([]);
  prisma.accessibilityLog.findFirst.mockResolvedValue(null);
  prisma.accessibilityLog.findUnique.mockResolvedValue(null);
  prisma.accessibilityLog.create.mockResolvedValue({
    id: "log-1",
    studentId: STUDENT_1,
    teacherId: TEACHER_A,
    category: "COMPORTAMENTO",
    description: "Teste",
    visibility: "PRIVATE",
    logDate: new Date(),
  });
  prisma.accessibilityLog.update.mockResolvedValue({
    id: "log-1",
    category: "COMPORTAMENTO",
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// LGPD E PRIVACIDADE
// ═════════════════════════════════════════════════════════════════════════════

describe("LGPD e Privacidade — Log Actions", () => {
  beforeEach(resetMocks);

  // ─── Multi-tenancy ─────────────────────────────────────────────────────
  describe("Multi-tenancy", () => {
    it("Professor A não acessa logs de aluno do Professor B", async () => {
      prisma.student.count.mockResolvedValue(0); // Not owner

      const result = await getLogs(STUDENT_1, TEACHER_B);

      expect(result.data).toBeNull();
      expect(result.error).toContain("não encontrado");
    });

    it("Professor A não cria log em aluno do Professor B", async () => {
      prisma.student.count.mockResolvedValue(0);

      const result = await createLog(
        {
          studentId: STUDENT_1,
          category: "COMPORTAMENTO",
          description: "Aluno comportado hoje.",
        },
        TEACHER_B
      );

      expect(result.data).toBeNull();
      expect(result.error).toContain("não encontrado");
    });

    it("Professor A não deleta log do Professor B", async () => {
      prisma.accessibilityLog.count.mockResolvedValue(0);

      const result = await deleteLog("log-1", TEACHER_B);

      expect(result.data).toBe(false);
      expect(result.error).toContain("não encontrado");
    });

    it("Professor A não atualiza log do Professor B", async () => {
      prisma.accessibilityLog.count.mockResolvedValue(0);

      const result = await updateLog(
        "log-1",
        { description: "Atualizado" },
        TEACHER_B
      );

      expect(result.data).toBeNull();
      expect(result.error).toContain("não encontrado");
    });
  });

  // ─── Validação de Inputs ───────────────────────────────────────────────
  describe("Validação de Inputs", () => {
    it("createLog rejeita descrição com menos de 10 caracteres", async () => {
      const result = await createLog(
        {
          studentId: STUDENT_1,
          category: "COMPORTAMENTO",
          description: "Curto", // 5 chars
        },
        TEACHER_A
      );

      expect(result.data).toBeNull();
      expect(result.error).toContain("10 caracteres");
    });

    it("createLog rejeita categoria inválida", async () => {
      const result = await createLog(
        {
          studentId: STUDENT_1,
          category: "INVALIDA",
          description: "Descrição válida com mais de 10 caracteres.",
        },
        TEACHER_A
      );

      expect(result.data).toBeNull();
      expect(result.error).toContain("Categoria");
    });

    it("createLog rejeita visibilidade inválida", async () => {
      const result = await createLog(
        {
          studentId: STUDENT_1,
          category: "COMPORTAMENTO",
          description: "Descrição válida com mais de 10 caracteres.",
          visibility: "PUBLICO",
        },
        TEACHER_A
      );

      expect(result.data).toBeNull();
      expect(result.error).toContain("Visibilidade");
    });

    it("createLog rejeita descrição vazia", async () => {
      const result = await createLog(
        {
          studentId: STUDENT_1,
          category: "COMPORTAMENTO",
          description: "",
        },
        TEACHER_A
      );

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });

    it("createLog aceita descrição com exatamente 10 caracteres", async () => {
      const result = await createLog(
        {
          studentId: STUDENT_1,
          category: "COMPORTAMENTO",
          description: "1234567890", // exatos 10
        },
        TEACHER_A
      );

      expect(result.data).not.toBeNull();
    });

    it("createLog rejeita descrição com mais de 5000 caracteres", async () => {
      const result = await createLog(
        {
          studentId: STUDENT_1,
          category: "COMPORTAMENTO",
          description: "x".repeat(5001),
        },
        TEACHER_A
      );

      expect(result.data).toBeNull();
      expect(result.error).toContain("5000");
    });
  });

  // ─── Visibilidade e Privacidade ────────────────────────────────────────
  describe("Visibilidade e Privacidade", () => {
    it("Log PRIVATE é criado com visibilidade padrão", async () => {
      const result = await createLog(
        {
          studentId: STUDENT_1,
          category: "COMPORTAMENTO",
          description: "Aluno participativo hoje na aula de matemática.",
        },
        TEACHER_A
      );

      expect(result.data).toBeDefined();
      expect(prisma.accessibilityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            visibility: "PRIVATE", // default
            teacherId: TEACHER_A,
          }),
        })
      );
    });

    it("Log com visibilidade FAMILY é criado corretamente", async () => {
      const result = await createLog(
        {
          studentId: STUDENT_1,
          category: "PROGRESSO",
          description: "Aluno melhorou a participação em grupo.",
          visibility: "FAMILY",
        },
        TEACHER_A
      );

      expect(result.data).toBeDefined();
      expect(prisma.accessibilityLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            visibility: "FAMILY",
          }),
        })
      );
    });
  });

  // ─── Filtros de getLogsFiltered ────────────────────────────────────────
  describe("Filtros de getLogsFiltered", () => {
    it("Filtra por categoria", async () => {
      prisma.accessibilityLog.findMany.mockResolvedValue([
        {
          id: "log-1",
          category: "CRISE",
          description: "Crise às 10h",
        },
      ]);

      const result = await getLogsFiltered(STUDENT_1, TEACHER_A, {
        category: "CRISE",
      });

      expect(prisma.accessibilityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: "CRISE",
          }),
        })
      );
    });

    it("Filtra por visibilidade", async () => {
      const result = await getLogsFiltered(STUDENT_1, TEACHER_A, {
        visibility: "FAMILY",
      });

      expect(prisma.accessibilityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            visibility: "FAMILY",
          }),
        })
      );
    });

    it("Filtra por período (startDate e endDate)", async () => {
      const startDate = new Date("2026-04-01");
      const endDate = new Date("2026-04-30");

      const result = await getLogsFiltered(STUDENT_1, TEACHER_A, {
        startDate,
        endDate,
      });

      expect(prisma.accessibilityLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            logDate: {
              gte: startDate,
              lte: endDate,
            },
          }),
        })
      );
    });
  });

  // ─── Update e Delete ───────────────────────────────────────────────────
  describe("Update e Delete", () => {
    it("updateLog atualiza apenas campos informados", async () => {
      prisma.accessibilityLog.count.mockResolvedValue(1);
      prisma.accessibilityLog.findUnique.mockResolvedValue({
        id: "log-1",
        category: "COMPORTAMENTO",
        description: "Original",
        visibility: "PRIVATE",
        logDate: new Date(),
      });
      prisma.accessibilityLog.update.mockResolvedValue({
        id: "log-1",
        category: "CRISE",
        description: "Original",
        visibility: "PRIVATE",
      });

      const result = await updateLog(
        "log-1",
        { category: "CRISE" },
        TEACHER_A
      );

      expect(result.data).toBeDefined();
      expect(prisma.accessibilityLog.update).toHaveBeenCalledWith({
        where: { id: "log-1" },
        data: expect.objectContaining({
          category: "CRISE",
        }),
      });
    });

    it("deleteLog usa soft delete (deletedAt) para auditoria LGPD", async () => {
      prisma.accessibilityLog.count.mockResolvedValue(1);
      prisma.accessibilityLog.update.mockResolvedValue({ id: "log-1" });

      const result = await deleteLog("log-1", TEACHER_A);

      // Soft delete — preserva registro para auditoria
      expect(prisma.accessibilityLog.update).toHaveBeenCalledWith({
        where: { id: "log-1" },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result.data).toBe(true);
    });
  });

  // ─── countLogs e getLastLog ────────────────────────────────────────────
  describe("Helpers", () => {
    it("countLogs retorna contagem correta", async () => {
      prisma.accessibilityLog.count.mockResolvedValue(5);

      const result = await countLogs(STUDENT_1, TEACHER_A);

      expect(result.data).toBe(5);
    });

    it("getLastLog retorna entrada mais recente", async () => {
      const mockLog = {
        id: "log-latest",
        category: "CRISE",
        description: "Última entrada",
        logDate: new Date(),
      };
      prisma.accessibilityLog.findFirst.mockResolvedValue(mockLog);

      const result = await getLastLog(STUDENT_1, TEACHER_A);

      expect(result.data).toEqual(mockLog);
    });

    it("getLastLog retorna null quando não há entradas", async () => {
      prisma.accessibilityLog.findFirst.mockResolvedValue(null);

      const result = await getLastLog(STUDENT_1, TEACHER_A);

      expect(result.data).toBeNull();
      expect(result.error).toBeNull(); // Não é erro
    });
  });
});
