-- MAPI — Initial Schema Migration
-- Database: PostgreSQL (Supabase + PgBouncer)
-- Generated: 2026-04-10
--
-- Este arquivo contém:
-- 1. Enums custom types
-- 2. Tables com foreign keys e constraints
-- 3. Indexes de performance
-- 4. Row Level Security (RLS) policies
-- 5. Funções auxiliares

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. ENUMS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE "PlanType" AS ENUM ('FREE', 'PREMIUM', 'SCHOOL');
CREATE TYPE "DiagnosisType" AS ENUM ('TEA', 'TDAH', 'TOD', 'DISLEXIA', 'DISCALCULIA', 'ALTAS_HABILIDADES', 'OUTRO', 'NAO_INFORMADO');
CREATE TYPE "LayoutType" AS ENUM ('ROWS', 'GROUPS', 'U_SHAPE', 'CUSTOM');
CREATE TYPE "RuleType" AS ENUM ('KEEP_TOGETHER', 'KEEP_APART', 'NEAR_FRONT', 'NEAR_TEACHER', 'NEAR_EXIT', 'AVOID_WINDOW');
CREATE TYPE "LogCategory" AS ENUM ('COMPORTAMENTO', 'CRISE', 'PROGRESSO', 'COMUNICACAO_FAMILIA', 'AVALIACAO', 'OUTRO');
CREATE TYPE "LogVisibility" AS ENUM ('PRIVATE', 'SCHOOL', 'FAMILY');

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- Teachers
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
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "onboarding_steps" JSONB NOT NULL DEFAULT '[]',
    "last_tooltip_step" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- Classes
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

-- Students
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

-- Seating Maps
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

-- Student Positions
CREATE TABLE "student_positions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "seating_map_id" UUID NOT NULL,
    "student_id" UUID NOT NULL,
    "position_x" INTEGER NOT NULL,
    "position_y" INTEGER NOT NULL,
    "desk_id" TEXT NOT NULL,

    CONSTRAINT "student_positions_pkey" PRIMARY KEY ("id")
);

-- Seating Rules
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

-- Accessibility Logs (Diário de Bordo)
CREATE TABLE "accessibility_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "student_id" UUID NOT NULL,
    "teacher_id" UUID NOT NULL,
    "log_date" TIMESTAMP(3) NOT NULL,
    "category" "LogCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "visibility" "LogVisibility" NOT NULL DEFAULT 'PRIVATE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "accessibility_logs_pkey" PRIMARY KEY ("id")
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. UNIQUE CONSTRAINTS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE UNIQUE INDEX "teachers_supabase_user_id_key" ON "teachers"("supabase_user_id");
CREATE UNIQUE INDEX "student_positions_seating_map_id_student_id_key" ON "student_positions"("seating_map_id", "student_id");

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

-- Teachers
CREATE INDEX "teachers_supabase_user_id_idx" ON "teachers"("supabase_user_id");
CREATE INDEX "teachers_email_idx" ON "teachers"("email");
CREATE INDEX "teachers_deleted_at_idx" ON "teachers"("deleted_at");
CREATE INDEX "teachers_onboarding_completed_idx" ON "teachers"("onboarding_completed");

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

-- Seating Maps
CREATE INDEX "seating_maps_class_id_idx" ON "seating_maps"("class_id");
CREATE INDEX "seating_maps_is_active_idx" ON "seating_maps"("is_active");
CREATE INDEX "seating_maps_class_id_is_active_idx" ON "seating_maps"("class_id", "is_active");

-- Student Positions
CREATE INDEX "student_positions_seating_map_id_idx" ON "student_positions"("seating_map_id");
CREATE INDEX "student_positions_student_id_idx" ON "student_positions"("student_id");
CREATE INDEX "student_positions_desk_id_idx" ON "student_positions"("desk_id");

-- Seating Rules
CREATE INDEX "seating_rules_class_id_idx" ON "seating_rules"("class_id");
CREATE INDEX "seating_rules_student_a_id_idx" ON "seating_rules"("student_a_id");
CREATE INDEX "seating_rules_student_b_id_idx" ON "seating_rules"("student_b_id");
CREATE INDEX "seating_rules_is_active_idx" ON "seating_rules"("is_active");
CREATE INDEX "seating_rules_class_id_is_active_idx" ON "seating_rules"("class_id", "is_active");
CREATE INDEX "seating_rules_rule_type_idx" ON "seating_rules"("rule_type");

-- Accessibility Logs
CREATE INDEX "accessibility_logs_student_id_idx" ON "accessibility_logs"("student_id");
CREATE INDEX "accessibility_logs_teacher_id_idx" ON "accessibility_logs"("teacher_id");
CREATE INDEX "accessibility_logs_log_date_idx" ON "accessibility_logs"("log_date");
CREATE INDEX "accessibility_logs_category_idx" ON "accessibility_logs"("category");
CREATE INDEX "accessibility_logs_visibility_idx" ON "accessibility_logs"("visibility");
CREATE INDEX "accessibility_logs_student_id_log_date_idx" ON "accessibility_logs"("student_id", "log_date");
CREATE INDEX "accessibility_logs_teacher_id_log_date_idx" ON "accessibility_logs"("teacher_id", "log_date");

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. FOREIGN KEYS
-- ═══════════════════════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE "teachers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "seating_maps" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "student_positions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "seating_rules" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "accessibility_logs" ENABLE ROW LEVEL SECURITY;

-- ─── Teachers ──────────────────────────────────────────────────────────────
-- Professores só podem ver/editar seu próprio registro

CREATE POLICY "teachers_select_own"
    ON "teachers" FOR SELECT
    USING (auth.uid() = supabase_user_id);

CREATE POLICY "teachers_update_own"
    ON "teachers" FOR UPDATE
    USING (auth.uid() = supabase_user_id);

CREATE POLICY "teachers_insert_own"
    ON "teachers" FOR INSERT
    WITH CHECK (auth.uid() = supabase_user_id);

-- ─── Classes ───────────────────────────────────────────────────────────────
-- Só o professor dono pode ver/editar suas turmas

CREATE POLICY "classes_select_own"
    ON "classes" FOR SELECT
    USING (auth.uid() = (SELECT supabase_user_id FROM teachers WHERE id = teacher_id));

CREATE POLICY "classes_update_own"
    ON "classes" FOR UPDATE
    USING (auth.uid() = (SELECT supabase_user_id FROM teachers WHERE id = teacher_id));

CREATE POLICY "classes_insert_own"
    ON "classes" FOR INSERT
    WITH CHECK (auth.uid() = (SELECT supabase_user_id FROM teachers WHERE id = teacher_id));

CREATE POLICY "classes_delete_own"
    ON "classes" FOR DELETE
    USING (auth.uid() = (SELECT supabase_user_id FROM teachers WHERE id = teacher_id));

-- ─── Students ──────────────────────────────────────────────────────────────
-- Acessível apenas pelo professor da turma

CREATE POLICY "students_select_via_class"
    ON "students" FOR SELECT
    USING (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            WHERE c.id = class_id
        )
    );

CREATE POLICY "students_update_via_class"
    ON "students" FOR UPDATE
    USING (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            WHERE c.id = class_id
        )
    );

CREATE POLICY "students_insert_via_class"
    ON "students" FOR INSERT
    WITH CHECK (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            WHERE c.id = class_id
        )
    );

CREATE POLICY "students_delete_via_class"
    ON "students" FOR DELETE
    USING (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            WHERE c.id = class_id
        )
    );

-- ─── Seating Maps ─────────────────────────────────────────────────────────

CREATE POLICY "seating_maps_select_via_class"
    ON "seating_maps" FOR SELECT
    USING (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            WHERE c.id = class_id
        )
    );

CREATE POLICY "seating_maps_insert_via_class"
    ON "seating_maps" FOR INSERT
    WITH CHECK (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            WHERE c.id = class_id
        )
    );

CREATE POLICY "seating_maps_update_via_class"
    ON "seating_maps" FOR UPDATE
    USING (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            WHERE c.id = class_id
        )
    );

CREATE POLICY "seating_maps_delete_via_class"
    ON "seating_maps" FOR DELETE
    USING (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            WHERE c.id = class_id
        )
    );

-- ─── Student Positions ────────────────────────────────────────────────────

CREATE POLICY "student_positions_select_via_class"
    ON "student_positions" FOR SELECT
    USING (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            JOIN seating_maps sm ON sm.class_id = c.id
            WHERE sm.id = seating_map_id
        )
    );

CREATE POLICY "student_positions_insert_via_class"
    ON "student_positions" FOR INSERT
    WITH CHECK (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            JOIN seating_maps sm ON sm.class_id = c.id
            WHERE sm.id = seating_map_id
        )
    );

CREATE POLICY "student_positions_update_via_class"
    ON "student_positions" FOR UPDATE
    USING (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            JOIN seating_maps sm ON sm.class_id = c.id
            WHERE sm.id = seating_map_id
        )
    );

CREATE POLICY "student_positions_delete_via_class"
    ON "student_positions" FOR DELETE
    USING (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            JOIN seating_maps sm ON sm.class_id = c.id
            WHERE sm.id = seating_map_id
        )
    );

-- ─── Seating Rules ────────────────────────────────────────────────────────

CREATE POLICY "seating_rules_select_via_class"
    ON "seating_rules" FOR SELECT
    USING (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            WHERE c.id = class_id
        )
    );

CREATE POLICY "seating_rules_insert_via_class"
    ON "seating_rules" FOR INSERT
    WITH CHECK (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            WHERE c.id = class_id
        )
    );

CREATE POLICY "seating_rules_update_via_class"
    ON "seating_rules" FOR UPDATE
    USING (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            WHERE c.id = class_id
        )
    );

CREATE POLICY "seating_rules_delete_via_class"
    ON "seating_rules" FOR DELETE
    USING (
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            WHERE c.id = class_id
        )
    );

-- ─── Accessibility Logs ───────────────────────────────────────────────────
-- Private por padrão, visível pelo professor dono e (futuramente) coordenação

CREATE POLICY "accessibility_logs_select_by_teacher"
    ON "accessibility_logs" FOR SELECT
    USING (
        auth.uid() = (
            SELECT supabase_user_id FROM teachers WHERE id = teacher_id
        )
        OR
        auth.uid() = (
            SELECT t.supabase_user_id
            FROM teachers t
            JOIN classes c ON c.teacher_id = t.id
            JOIN students s ON s.class_id = c.id
            WHERE s.id = student_id
        )
    );

CREATE POLICY "accessibility_logs_insert_by_teacher"
    ON "accessibility_logs" FOR INSERT
    WITH CHECK (
        auth.uid() = (
            SELECT supabase_user_id FROM teachers WHERE id = teacher_id
        )
    );

CREATE POLICY "accessibility_logs_update_by_teacher"
    ON "accessibility_logs" FOR UPDATE
    USING (
        auth.uid() = (
            SELECT supabase_user_id FROM teachers WHERE id = teacher_id
        )
    );

CREATE POLICY "accessibility_logs_soft_delete_by_teacher"
    ON "accessibility_logs" FOR UPDATE
    USING (
        auth.uid() = (
            SELECT supabase_user_id FROM teachers WHERE id = teacher_id
        )
    );

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. FUNÇÕES AUXILIARES
-- ═══════════════════════════════════════════════════════════════════════════

-- Função para contar alunos de uma turma (atualização automática do student_count)
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
    -- No INSERT/UPDATE, incrementa
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE classes
        SET student_count = (
            SELECT COUNT(*) FROM students WHERE class_id = NEW.class_id AND deleted_at IS NULL
        )
        WHERE id = NEW.class_id;
    END IF;

    -- No DELETE, decrementa
    IF TG_OP = 'DELETE' THEN
        UPDATE classes
        SET student_count = (
            SELECT COUNT(*) FROM students WHERE class_id = OLD.class_id AND deleted_at IS NULL
        )
        WHERE id = OLD.class_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar student_count automaticamente
CREATE TRIGGER trg_update_student_count
    AFTER INSERT OR UPDATE OR DELETE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_class_student_count();

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. COMENTÁRIOS NO BANCO (para documentação)
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE "teachers" IS 'Professores do MAPI - vinculados ao Supabase Auth';
COMMENT ON TABLE "classes" IS 'Turmas criadas pelos professores';
COMMENT ON TABLE "students" IS 'Alunos das turmas - dados sensíveis criptografados na aplicação';
COMMENT ON TABLE "seating_maps" IS 'Mapas de assentos de cada turma';
COMMENT ON TABLE "student_positions" IS 'Posições dos alunos em cada mapa';
COMMENT ON TABLE "seating_rules" IS 'Regras de posicionamento (KEEP_APART, KEEP_TOGETHER, etc.)';
COMMENT ON TABLE "accessibility_logs" IS 'Diário de Bordo - registros de comportamento e acessibilidade';
COMMENT ON COLUMN "students"."diagnosis_notes" IS 'OBSERVAÇÃO: Dados sensíveis - criptografados na aplicação com AES-256-GCM';
COMMENT ON COLUMN "accessibility_logs"."description" IS 'OBSERVAÇÃO: Dados sensíveis - criptografados na aplicação com AES-256-GCM';
