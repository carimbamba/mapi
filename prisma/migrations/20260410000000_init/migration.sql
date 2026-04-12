-- MAPI — Initial Migration
-- Generated: 2026-04-10
-- Database: PostgreSQL 15+ (Supabase)
-- Description: Cria todas as tabelas, enums e índices do MAPI

-- ─── Enums ───────────────────────────────────────────────────────────────────

CREATE TYPE "PlanType" AS ENUM ('FREE', 'PREMIUM', 'SCHOOL');
CREATE TYPE "DiagnosisType" AS ENUM ('TEA', 'TDAH', 'TOD', 'DISLEXIA', 'DISCALCULIA', 'ALTAS_HABILIDADES', 'OUTRO', 'NAO_INFORMADO');
CREATE TYPE "LayoutType" AS ENUM ('ROWS', 'GROUPS', 'U_SHAPE', 'CUSTOM');
CREATE TYPE "RuleType" AS ENUM ('KEEP_TOGETHER', 'KEEP_APART', 'NEAR_FRONT', 'NEAR_TEACHER', 'NEAR_EXIT', 'AVOID_WINDOW');
CREATE TYPE "LogCategory" AS ENUM ('COMPORTAMENTO', 'CRISE', 'PROGRESSO', 'COMUNICACAO_FAMILIA', 'AVALIACAO', 'OUTRO');
CREATE TYPE "LogVisibility" AS ENUM ('PRIVATE', 'SCHOOL', 'FAMILY');

-- ─── Tables ──────────────────────────────────────────────────────────────────

CREATE TABLE "teachers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "supabase_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "school" TEXT,
    "plan_type" "PlanType" NOT NULL DEFAULT 'FREE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "classes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "teacher_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT,
    "year" TEXT NOT NULL,
    "period" TEXT,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "students" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "class_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "has_accessibility_needs" BOOLEAN NOT NULL DEFAULT false,
    "diagnosis_type" "DiagnosisType",
    "diagnosis_notes" TEXT,
    "priority_seating" BOOLEAN NOT NULL DEFAULT false,
    "parent_consent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seating_maps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "class_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "layout_type" "LayoutType" NOT NULL,
    "layout_config" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seating_maps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_positions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seating_map_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "position_x" INTEGER NOT NULL,
    "position_y" INTEGER NOT NULL,
    "desk_id" TEXT NOT NULL,

    CONSTRAINT "student_positions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "seating_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "class_id" UUID NOT NULL,
    "rule_type" "RuleType" NOT NULL,
    "student_a_id" UUID NOT NULL,
    "student_b_id" UUID,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "seating_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "accessibility_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "log_date" TIMESTAMP(3) NOT NULL,
    "category" "LogCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "visibility" "LogVisibility" NOT NULL DEFAULT 'PRIVATE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accessibility_logs_pkey" PRIMARY KEY ("id")
);

-- ─── Unique Constraints ──────────────────────────────────────────────────────

CREATE UNIQUE INDEX "teachers_supabase_user_id_key" ON "teachers"("supabase_user_id");
CREATE UNIQUE INDEX "student_positions_seating_map_id_student_id_key" ON "student_positions"("seating_map_id", "student_id");

-- ─── Indexes ─────────────────────────────────────────────────────────────────

-- Teachers
CREATE INDEX "teachers_supabase_user_id_idx" ON "teachers"("supabase_user_id");
CREATE INDEX "teachers_email_idx" ON "teachers"("email");
CREATE INDEX "teachers_deleted_at_idx" ON "teachers"("deleted_at");

-- Classes
CREATE INDEX "classes_teacher_id_idx" ON "classes"("teacher_id");
CREATE INDEX "classes_is_archived_idx" ON "classes"("is_archived");
CREATE INDEX "classes_deleted_at_idx" ON "classes"("deleted_at");
CREATE INDEX "classes_teacher_id_is_archived_idx" ON "classes"("teacher_id", "is_archived");

-- Students
CREATE INDEX "students_class_id_idx" ON "students"("class_id");
CREATE INDEX "students_deleted_at_idx" ON "students"("deleted_at");
CREATE INDEX "students_has_accessibility_needs_idx" ON "students"("has_accessibility_needs");
CREATE INDEX "students_diagnosis_type_idx" ON "students"("diagnosis_type");
CREATE INDEX "students_class_id_deleted_at_idx" ON "students"("class_id", "deleted_at");

-- SeatingMaps
CREATE INDEX "seating_maps_class_id_idx" ON "seating_maps"("class_id");
CREATE INDEX "seating_maps_is_active_idx" ON "seating_maps"("is_active");
CREATE INDEX "seating_maps_class_id_is_active_idx" ON "seating_maps"("class_id", "is_active");

-- StudentPositions
CREATE INDEX "student_positions_seating_map_id_idx" ON "student_positions"("seating_map_id");
CREATE INDEX "student_positions_student_id_idx" ON "student_positions"("student_id");
CREATE INDEX "student_positions_desk_id_idx" ON "student_positions"("desk_id");

-- SeatingRules
CREATE INDEX "seating_rules_class_id_idx" ON "seating_rules"("class_id");
CREATE INDEX "seating_rules_student_a_id_idx" ON "seating_rules"("student_a_id");
CREATE INDEX "seating_rules_student_b_id_idx" ON "seating_rules"("student_b_id");
CREATE INDEX "seating_rules_is_active_idx" ON "seating_rules"("is_active");
CREATE INDEX "seating_rules_class_id_is_active_idx" ON "seating_rules"("class_id", "is_active");
CREATE INDEX "seating_rules_rule_type_idx" ON "seating_rules"("rule_type");

-- AccessibilityLogs
CREATE INDEX "accessibility_logs_student_id_idx" ON "accessibility_logs"("student_id");
CREATE INDEX "accessibility_logs_teacher_id_idx" ON "accessibility_logs"("teacher_id");
CREATE INDEX "accessibility_logs_log_date_idx" ON "accessibility_logs"("log_date");
CREATE INDEX "accessibility_logs_category_idx" ON "accessibility_logs"("category");
CREATE INDEX "accessibility_logs_visibility_idx" ON "accessibility_logs"("visibility");
CREATE INDEX "accessibility_logs_student_id_log_date_idx" ON "accessibility_logs"("student_id", "log_date");
CREATE INDEX "accessibility_logs_teacher_id_log_date_idx" ON "accessibility_logs"("teacher_id", "log_date");

-- ─── Foreign Keys ────────────────────────────────────────────────────────────

ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_fkey" 
    FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE;

ALTER TABLE "students" ADD CONSTRAINT "students_class_id_fkey" 
    FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE;

ALTER TABLE "seating_maps" ADD CONSTRAINT "seating_maps_class_id_fkey" 
    FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE;

ALTER TABLE "student_positions" ADD CONSTRAINT "student_positions_seating_map_id_fkey" 
    FOREIGN KEY ("seating_map_id") REFERENCES "seating_maps"("id") ON DELETE CASCADE;

ALTER TABLE "student_positions" ADD CONSTRAINT "student_positions_student_id_fkey" 
    FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE;

ALTER TABLE "seating_rules" ADD CONSTRAINT "seating_rules_class_id_fkey" 
    FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE;

ALTER TABLE "seating_rules" ADD CONSTRAINT "seating_rules_student_a_id_fkey" 
    FOREIGN KEY ("student_a_id") REFERENCES "students"("id") ON DELETE CASCADE;

ALTER TABLE "seating_rules" ADD CONSTRAINT "seating_rules_student_b_id_fkey" 
    FOREIGN KEY ("student_b_id") REFERENCES "students"("id") ON DELETE SET NULL;

ALTER TABLE "accessibility_logs" ADD CONSTRAINT "accessibility_logs_student_id_fkey" 
    FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE;

ALTER TABLE "accessibility_logs" ADD CONSTRAINT "accessibility_logs_teacher_id_fkey" 
    FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE;

-- ─── RLS (Row Level Security) — Supabase ─────────────────────────────────────
-- Descomente após aplicar a migração para ativar proteção no Supabase

-- ALTER TABLE "teachers" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "classes" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "seating_maps" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "student_positions" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "seating_rules" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "accessibility_logs" ENABLE ROW LEVEL SECURITY;

-- Exemplo de política RLS (descomentar e ajustar):
-- CREATE POLICY "Users can view own classes"
--   ON "classes" FOR SELECT
--   USING (auth.uid() = (SELECT supabase_user_id FROM teachers WHERE id = teacher_id));
