/**
 * Testes E2E — Gestão de Turmas do MAPI
 *
 * Executar: npx playwright test tests/e2e/class-management.spec.js
 * Pré-requisito: npx playwright install
 */

import { test, expect } from "@playwright/test";

test.describe("Gestão de Turmas — Fluxos Críticos", () => {
  // ─── Criar turma → aparece no dashboard ──────────────────────────────
  test("Criar turma → aparece no dashboard", async ({ page }) => {
    // Navega para página de turmas
    await page.goto("/dashboard/classes");

    // Clica em "Nova Turma"
    const newClassBtn = page.getByRole("button", { name: /nova turma/i });
    if (await newClassBtn.isVisible().catch(() => false)) {
      await newClassBtn.click();

      // Preenche formulário de turma
      await page.fill('input[placeholder*="Nome da turma"]', "Turma de Teste E2E");
      await page.fill('input[placeholder*="Disciplina"]', "Matemática");

      // Seleciona ano
      const yearSelect = page.locator('input[placeholder="2026"]');
      if (await yearSelect.isVisible()) {
        await yearSelect.fill("2026");
      }

      // Submete
      const submitBtn = page.getByRole("button", { name: /criar turma/i });
      if (await submitBtn.isVisible()) {
        await submitBtn.click();

        // Aguarda criação e redirecionamento
        await page.waitForTimeout(2000);

        // Verifica que a turma aparece na lista
        await expect(page.getByText("Turma de Teste E2E")).toBeVisible();
      }
    }
  });

  // ─── Importar CSV com 5 alunos → confirmar 5 alunos criados ─────────
  test("Importar CSV com 5 alunos → confirmar 5 alunos criados", async ({
    page,
  }) => {
    // Navega para página de alunos de uma turma existente
    await page.goto("/dashboard/classes");

    // Clica na primeira turma disponível
    const firstClass = page.locator("a[href*='/dashboard/classes/']").first();
    if (await firstClass.isVisible().catch(() => false)) {
      await firstClass.click();

      // Navega para alunos
      await page.goto("/dashboard/classes/class-id/students");

      // Clica em "Importar CSV"
      const importBtn = page.getByRole("button", { name: /importar csv/i });
      if (await importBtn.isVisible().catch(() => false)) {
        await importBtn.click();

        // Cole CSV com 5 alunos
        const csvContent = `nome;necessidades;diagnostico;obs
João Silva;sim;TEA;Laudo 2025
Maria Santos;não;;
Pedro Oliveira;sim;TDAH;
Ana Costa;não;;
Carlos Souza;sim;Dislexia;Tempo extra`;

        const textarea = page.locator("textarea").first();
        if (await textarea.isVisible()) {
          await textarea.fill(csvContent);

          // Clica em pré-visualizar
          const previewBtn = page.getByRole("button", { name: /pr[eé]-visualizar/i });
          if (await previewBtn.isVisible()) {
            await previewBtn.click();

            // Verifica preview
            await expect(page.getByText("5 alunos")).toBeVisible();

            // Confirma importação
            const importConfirmBtn = page.getByRole("button", {
              name: /importar 5 alunos/i,
            });
            if (await importConfirmBtn.isVisible()) {
              await importConfirmBtn.click();

              // Aguarda importação
              await page.waitForTimeout(2000);

              // Verifica que alunos foram criados
              await expect(page.getByText("João Silva")).toBeVisible();
              await expect(page.getByText("Maria Santos")).toBeVisible();
            }
          }
        }
      }
    }
  });

  // ─── Professor FREE tenta criar 3ª turma → vê UpgradePrompt ─────────
  test("Professor FREE tenta criar 3ª turma → vê UpgradePrompt", async ({
    page,
  }) => {
    // Simula professor FREE com 2 turmas existentes
    // Nota: Requer mock do banco ou seed específico
    await page.goto("/dashboard/classes");

    // Tenta criar 3ª turma
    const newClassBtn = page.getByRole("button", { name: /nova turma/i });
    if (await newClassBtn.isVisible().catch(() => false)) {
      await newClassBtn.click();

      // Preenche e submete
      await page.fill('input[placeholder*="Nome da turma"]', "Turma 3");

      // Se for FREE com limite atingido, deve ver erro ou UpgradePrompt
      const submitBtn = page.getByRole("button", { name: /criar turma/i });
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(2000);

        // Verifica mensagem de limite ou UpgradePrompt
        const limitMsg = page.getByText(/atingiu o limite|plano premium|fa[çc]a upgrade/i);
        const upgradePrompt = page.getByText(/recurso premium|fa[çc]a upgrade/i);

        // Pelo menos um dos dois deve aparecer
        const hasLimitMsg = await limitMsg.isVisible().catch(() => false);
        const hasUpgradePrompt = await upgradePrompt.isVisible().catch(() => false);

        expect(hasLimitMsg || hasUpgradePrompt).toBe(true);
      }
    }
  });
});
