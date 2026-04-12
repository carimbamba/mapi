/**
 * MAPI — Seed Script para Demonstração
 *
 * Popula o banco com dados de demonstração:
 * - 1 professor de teste
 * - 2 turmas (uma com alunos neurodivergentes)
 * - Mapa já configurado
 * - Algumas entradas no diário
 *
 * Uso no Supabase Dashboard → SQL Editor:
 *   Copiar e colar este arquivo
 */

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED DATA — Dados de Demonstração
-- ═══════════════════════════════════════════════════════════════════════════

-- Nota: Em produção real, o teacher é criado automaticamente
-- quando o usuário faz signup via Supabase Auth.
-- Este seed é apenas para demonstração/desenvolvimento.

-- ─── Professor de Teste ──────────────────────────────────────────────────

-- Substitua o UUID pelo ID real do usuário criado no Supabase Auth
-- Ou crie manualmente via Dashboard → Authentication → Users
INSERT INTO "teachers" (
    "id",
    "supabase_user_id",
    "name",
    "email",
    "school",
    "plan_type",
    "onboarding_completed",
    "onboarding_steps",
    "last_tooltip_step"
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000', -- Substituir pelo ID do Auth user
    'Professora Ana Silva',
    'ana.silva@escola.edu.br',
    'Escola Municipal Monteiro Lobato',
    'PREMIUM',
    true,
    '[1, 2, 3, 4, 5]',
    4
) ON CONFLICT DO NOTHING;

-- ─── Turma 1: 5º Ano A — Com alunos neurodivergentes ────────────────────

INSERT INTO "classes" (
    "id",
    "teacher_id",
    "name",
    "subject",
    "year",
    "period",
    "is_archived"
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM "teachers" LIMIT 1),
    '5º Ano A',
    'Pedagogia Geral',
    '2026',
    'Manhã',
    false
) ON CONFLICT DO NOTHING;

-- ─── Alunos da Turma 1 ──────────────────────────────────────────────────

-- João — TEA, assento prioritário, consentimento dado
INSERT INTO "students" (
    "id",
    "class_id",
    "name",
    "has_accessibility_needs",
    "diagnosis_type",
    "diagnosis_notes",
    "priority_seating",
    "parent_consent"
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM "classes" WHERE name = '5º Ano A' LIMIT 1),
    'João Pedro Oliveira',
    true,
    'TEA',
    'Laudo de 2025 — Dr. Marcos Ribeiro (CRM 12345). Nível 1 de suporte. Sensibilidade auditiva. Beneficia de rotina visual e cantinho da calma.',
    true,
    true
) ON CONFLICT DO NOTHING;

-- Maria — TDAH
INSERT INTO "students" (
    "id",
    "class_id",
    "name",
    "has_accessibility_needs",
    "diagnosis_type",
    "diagnosis_notes",
    "priority_seating",
    "parent_consent"
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM "classes" WHERE name = '5º Ano A' LIMIT 1),
    'Maria Eduarda Santos',
    true,
    'TDAH',
    'Diagnóstico de 2025 — Dra. Fernanda Lima (CRM 54321). Medicada. Beneficia de pausas a cada 20 min e assento próximo ao professor.',
    true,
    true
) ON CONFLICT DO NOTHING;

-- Pedro — Dislexia
INSERT INTO "students" (
    "id",
    "class_id",
    "name",
    "has_accessibility_needs",
    "diagnosis_type",
    "diagnosis_notes",
    "priority_seating",
    "parent_consent"
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM "classes" WHERE name = '5º Ano A' LIMIT 1),
    'Pedro Henrique Costa',
    true,
    'DISLEXIA',
    'Avaliação psicopedagógica 2025. Dificuldade em decodificação. Beneficia de tempo extra e material em áudio.',
    false,
    true
) ON CONFLICT DO NOTHING;

-- Ana — Sem necessidades
INSERT INTO "students" (
    "id",
    "class_id",
    "name",
    "has_accessibility_needs",
    "priority_seating"
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM "classes" WHERE name = '5º Ano A' LIMIT 1),
    'Ana Clara Ferreira',
    false,
    false
) ON CONFLICT DO NOTHING;

-- Lucas — Sem necessidades
INSERT INTO "students" (
    "id",
    "class_id",
    "name",
    "has_accessibility_needs",
    "priority_seating"
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM "classes" WHERE name = '5º Ano A' LIMIT 1),
    'Lucas Gabriel Almeida',
    false,
    false
) ON CONFLICT DO NOTHING;

-- Sofia — Altas Habilidades
INSERT INTO "students" (
    "id",
    "class_id",
    "name",
    "has_accessibility_needs",
    "diagnosis_type",
    "diagnosis_notes",
    "priority_seating",
    "parent_consent"
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM "classes" WHERE name = '5º Ano A' LIMIT 1),
    'Sofia Beatriz Rocha',
    true,
    'ALTAS_HABILIDADES',
    'Identificada em 2025 — Raciocínio lógico avançado. Beneficia de atividades de aprofundamento.',
    false,
    true
) ON CONFLICT DO NOTHING;

-- ─── Turma 2: 3º Ano B — Sem necessidades especiais ─────────────────────

INSERT INTO "classes" (
    "id",
    "teacher_id",
    "name",
    "subject",
    "year",
    "period"
) VALUES (
    gen_random_uuid(),
    (SELECT id FROM "teachers" LIMIT 1),
    '3º Ano B',
    'Matemática',
    '2026',
    'Tarde'
) ON CONFLICT DO NOTHING;

-- Alunos da Turma 2
INSERT INTO "students" ("class_id", "name", "has_accessibility_needs")
SELECT id, 'Carlos Eduardo Silva', false
FROM "classes" WHERE name = '3º Ano B' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO "students" ("class_id", "name", "has_accessibility_needs")
SELECT id, 'Juliana Martins Souza', false
FROM "classes" WHERE name = '3º Ano B' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO "students" ("class_id", "name", "has_accessibility_needs")
SELECT id, 'Rafael Oliveira Lima', false
FROM "classes" WHERE name = '3º Ano B' LIMIT 1
ON CONFLICT DO NOTHING;

-- ─── Mapa de Assentos (Turma 1) ────────────────────────────────────────

-- Cria mapa ativo para 5º Ano A
INSERT INTO "seating_maps" (
    "id",
    "class_id",
    "name",
    "layout_type",
    "layout_config",
    "is_active"
)
SELECT
    gen_random_uuid(),
    c.id,
    'Mapa Gerado Automaticamente — 10/04/2026',
    'ROWS',
    '{"type": "rows", "rows": 3, "cols": 3, "algorithm": "greedy-csp"}'::jsonb,
    true
FROM "classes" c
WHERE c.name = '5º Ano A'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ─── Entradas no Diário de Bordo (Turma 1) ──────────────────────────────

-- Entrada 1: Comportamento positivo do João
INSERT INTO "accessibility_logs" (
    "student_id",
    "teacher_id",
    "log_date",
    "category",
    "description",
    "visibility"
)
SELECT
    s.id,
    t.id,
    NOW() - INTERVAL '2 days',
    'PROGRESSO',
    'João participou da atividade em grupo por 15 minutos sem sinais de sobrecarga. Usou o cantinho da calma voluntariamente antes de voltar. Progresso significativo!',
    'PRIVATE'
FROM "students" s, "teachers" t
WHERE s.name = 'João Pedro Oliveira'
  AND t.name = 'Professora Ana Silva'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Entrada 2: Crise da Maria
INSERT INTO "accessibility_logs" (
    "student_id",
    "teacher_id",
    "log_date",
    "category",
    "description",
    "visibility"
)
SELECT
    s.id,
    t.id,
    NOW() - INTERVAL '1 day',
    'CRISE',
    'Maria apresentou inquietação durante prova de matemática. Levantou 3 vezes sem permissão. Aplicada pausa de 5 min no corredor. Retornou calma e concluiu a prova.',
    'SCHOOL'
FROM "students" s, "teachers" t
WHERE s.name = 'Maria Eduarda Santos'
  AND t.name = 'Professora Ana Silva'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Entrada 3: Comunicação com família do Pedro
INSERT INTO "accessibility_logs" (
    "student_id",
    "teacher_id",
    "log_date",
    "category",
    "description",
    "visibility"
)
SELECT
    s.id,
    t.id,
    NOW() - INTERVAL '3 days',
    'COMUNICACAO_FAMILIA',
    'Conversei com a mãe do Pedro. Ela relatou que ele está usando o app de leitura em casa e melhorou a fluência. Sugeri continuar com 15 min/dia. Mãe ficou receptiva.',
    'FAMILY'
FROM "students" s, "teachers" t
WHERE s.name = 'Pedro Henrique Costa'
  AND t.name = 'Professora Ana Silva'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ─── Regras de Posicionamento (Turma 1) ─────────────────────────────────

-- João (TEA) e Sofia (AH) devem ficar separados
INSERT INTO "seating_rules" (
    "class_id",
    "rule_type",
    "student_a_id",
    "student_b_id",
    "priority",
    "is_active"
)
SELECT
    c.id,
    'KEEP_APART',
    s1.id,
    s2.id,
    8,
    true
FROM "classes" c
JOIN "students" s1 ON s1.class_id = c.id AND s1.name = 'João Pedro Oliveira'
JOIN "students" s2 ON s2.class_id = c.id AND s2.name = 'Sofia Beatriz Rocha'
WHERE c.name = '5º Ano A'
ON CONFLICT DO NOTHING;
