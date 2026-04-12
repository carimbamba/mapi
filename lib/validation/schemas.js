/**
 * Schemas de Validação — MAPI
 *
 * Todos os inputs de Server Actions e API Routes passam por validação Zod aqui.
 *
 * Uso:
 *   import { createClassSchema } from "@/lib/validation/schemas";
 *   const result = createClassSchema.safeParse(input);
 *   if (!result.success) { return { data: null, error: result.error.errors[0].message }; }
 */

import { z } from "zod";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const planTypeEnum = z.enum(["FREE", "PREMIUM", "SCHOOL"]);

export const diagnosisTypeEnum = z.enum([
  "TEA",
  "TDAH",
  "TOD",
  "DISLEXIA",
  "DISCALCULIA",
  "ALTAS_HABILIDADES",
  "OUTRO",
  "NAO_INFORMADO",
]);

export const layoutTypeEnum = z.enum([
  "ROWS",
  "GROUPS",
  "U_SHAPE",
  "CUSTOM",
]);

export const ruleTypeEnum = z.enum([
  "KEEP_TOGETHER",
  "KEEP_APART",
  "NEAR_FRONT",
  "NEAR_TEACHER",
  "NEAR_EXIT",
  "AVOID_WINDOW",
]);

export const logCategoryEnum = z.enum([
  "COMPORTAMENTO",
  "CRISE",
  "PROGRESSO",
  "COMUNICACAO_FAMILIA",
  "AVALIACAO",
  "OUTRO",
]);

export const logVisibilityEnum = z.enum([
  "PRIVATE",
  "SCHOOL",
  "FAMILY",
]);

// ─── Class Schemas ───────────────────────────────────────────────────────────

export const createClassSchema = z.object({
  name: z
    .string({ required_error: "Nome da turma é obrigatório" })
    .min(2, "Nome da turma deve ter pelo menos 2 caracteres")
    .max(100, "Nome da turma deve ter no máximo 100 caracteres")
    .trim(),
  subject: z.string().max(100).optional().or(z.literal("")),
  year: z
    .string()
    .regex(/^\d{4}$/, "Ano deve ter 4 dígitos")
    .optional()
    .or(z.literal("")),
  period: z.string().max(50).optional().or(z.literal("")),
});

export const updateClassSchema = z.object({
  name: z
    .string()
    .min(2, "Nome da turma deve ter pelo menos 2 caracteres")
    .max(100)
    .trim()
    .optional(),
  subject: z.string().max(100).optional().or(z.literal("")).nullable(),
  year: z
    .string()
    .regex(/^\d{4}$/, "Ano deve ter 4 dígitos")
    .optional()
    .or(z.literal("")),
  period: z.string().max(50).optional().or(z.literal("")).nullable(),
  isArchived: z.boolean().optional(),
});

// ─── Student Schemas ─────────────────────────────────────────────────────────

export const createStudentSchema = z.object({
  name: z
    .string({ required_error: "Nome do aluno é obrigatório" })
    .min(2, "Nome do aluno deve ter pelo menos 2 caracteres")
    .max(200, "Nome do aluno deve ter no máximo 200 caracteres")
    .trim(),
  hasAccessibilityNeeds: z.boolean().default(false),
  diagnosisType: diagnosisTypeEnum.nullable().default(null),
  diagnosisNotes: z.string().max(2000).nullable().default(null),
  prioritySeating: z.boolean().default(false),
  parentConsent: z.boolean().default(false),
});

export const updateStudentSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(200)
    .trim()
    .optional(),
  hasAccessibilityNeeds: z.boolean().optional(),
  diagnosisType: diagnosisTypeEnum.nullable().optional(),
  diagnosisNotes: z.string().max(2000).nullable().optional(),
  prioritySeating: z.boolean().optional(),
  parentConsent: z.boolean().optional(),
});

// ─── CSV Import Schema ───────────────────────────────────────────────────────

export const csvRowSchema = z.object({
  nome: z
    .string({ required_error: "Nome é obrigatório" })
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(200)
    .trim(),
  necessidades: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === "boolean") return val;
      return val.toLowerCase().trim() === "sim" || val.trim() === "s" || val.trim() === "1" || val.trim() === "true";
    })
    .default(false),
  diagnostico: diagnosisTypeEnum
    .nullable()
    .default(null),
  obs: z.string().max(2000).nullable().default(null),
});

// ─── Seating Rule Schema ─────────────────────────────────────────────────────

export const createSeatingRuleSchema = z.object({
  classId: z.string().uuid("classId deve ser um UUID válido"),
  ruleType: ruleTypeEnum,
  studentAId: z.string().uuid("studentAId deve ser um UUID válido"),
  studentBId: z.string().uuid("studentBId deve ser um UUID válido").nullable().default(null),
  priority: z.number().int().min(1).max(10).default(1),
});

// ─── Accessibility Log Schema ────────────────────────────────────────────────

export const createLogSchema = z.object({
  studentId: z.string().uuid("studentId deve ser um UUID válido"),
  category: logCategoryEnum,
  description: z
    .string({ required_error: "Descrição é obrigatória" })
    .min(10, "Descrição deve ter pelo menos 10 caracteres")
    .max(5000, "Descrição deve ter no máximo 5000 caracteres")
    .trim(),
  visibility: logVisibilityEnum.default("PRIVATE"),
});

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Valida um input contra um schema Zod
 * @template T
 * @param {import('zod').ZodSchema<T>} schema
 * @param {unknown} input
 * @returns {{ data: T | null, error: string | null }}
 */
export function validate(schema, input) {
  const result = schema.safeParse(input);

  if (!result.success) {
    const firstError = result.error.errors[0]?.message || "Dados inválidos";
    return { data: null, error: firstError };
  }

  return { data: result.data, error: null };
}
