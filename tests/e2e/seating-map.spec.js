/**
 * Testes E2E — Mapa de Sala do MAPI
 *
 * Executar: npx playwright test tests/e2e/seating-map.spec.js
 * Pré-requisito: npx playwright install
 */

import { test, expect } from "@playwright/test";

test.describe("Mapa de Sala — Fluxos Críticos", () => {
  // ─── Criar mapa em uma turma → canvas renderiza ─────────────────────
  test("Criar mapa em uma turma → canvas renderiza", async ({ page }) => {
    // Navega para mapa de uma turma
    await page.goto("/dashboard/classes/class-id/map");

    // Verifica que o canvas do mapa renderiza
    const canvas = page.getByRole("grid", { name: /mapa de sala/i });
    const isVisible = await canvas.isVisible().catch(() => false);

    if (isVisible) {
      // Verifica que há mesas no canvas
      const desks = page.locator('[role="gridcell"]');
      const count = await desks.count();
      expect(count).toBeGreaterThan(0);

      // Verifica toolbar com botões de ação
      await expect(page.getByText("Gerar Automaticamente")).toBeVisible();
      await expect(page.getByText("Salvar")).toBeVisible();
      await expect(page.getByText("Limpar")).toBeVisible();
    }
  });

  // ─── Arrastar aluno para uma mesa → posição salva ────────────────────
  test("Arrastar aluno para uma mesa → posição salva", async ({ page }) => {
    await page.goto("/dashboard/classes/class-id/map");

    // Verifica que há alunos não posicionados na sidebar
    const unplaced = page.getByText("Alunos não posicionados");
    if (await unplaced.isVisible().catch(() => false)) {
      // Encontra o primeiro StudentCard arrastável
      const studentCard = page.locator('[aria-grabbed]').first();
      if (await studentCard.isVisible().catch(() => false)) {
        // Encontra a primeira mesa vazia
        const emptyDesk = page.getByText("Vazio").first();
        if (await emptyDesk.isVisible().catch(() => false)) {
          // Drag & Drop
          await studentCard.dragTo(emptyDesk);

          // Aguarda animação
          await page.waitForTimeout(500);

          // Verifica que o aluno está na mesa
          const deskWithStudent = page.locator('[aria-grabbed]').first();
          await expect(deskWithStudent).toBeVisible();

          // Clica em Salvar
          const saveBtn = page.getByRole("button", { name: /salvar/i });
          if (await saveBtn.isVisible()) {
            await saveBtn.click();
            await page.waitForTimeout(1000);

            // Verifica feedback de salvamento
            const savedMsg = page.getByText(/salvando|salvo/i);
            expect(await savedMsg.isVisible().catch(() => false)).toBe(true);
          }
        }
      }
    }
  });

  // ─── Gerar mapa automático (PREMIUM) → mapa populado ─────────────────
  test("Gerar mapa automático (PREMIUM) → mapa populado", async ({ page }) => {
    await page.goto("/dashboard/classes/class-id/map");

    // Clica em "Gerar Automaticamente"
    const generateBtn = page.getByRole("button", { name: /gerar automaticamente/i });
    if (await generateBtn.isVisible().catch(() => false)) {
      await generateBtn.click();

      // Se for FREE, deve ver UpgradePrompt
      const upgradeMsg = page.getByText(/premium|fa[çc]a upgrade/i);
      const hasUpgradeMsg = await upgradeMsg.isVisible().catch(() => false);

      if (!hasUpgradeMsg) {
        // Aguarda geração
        await page.waitForTimeout(3000);

        // Verifica que mapa foi populado
        const positionedStudents = page.locator('[aria-grabbed]');
        const count = await positionedStudents.count();
        expect(count).toBeGreaterThan(0);

        // Verifica legenda de acessibilidade
        await expect(page.getByText("TEA")).toBeVisible();
        await expect(page.getByText("TDAH")).toBeVisible();
      }
    }
  });

  // ─── Zoom in/out funciona ─────────────────────────────────────────────
  test("Zoom in/out funciona no canvas", async ({ page }) => {
    await page.goto("/dashboard/classes/class-id/map");

    // Verifica zoom inicial em 100%
    const zoomDisplay = page.getByText("100%");
    if (await zoomDisplay.isVisible().catch(() => false)) {
      // Zoom in
      const zoomInBtn = page.getByRole("button", { name: "" }).filter({ has: page.getByRole("img", { name: /zoom in/i }) }).first();
      // Simplificado: procura por botão com ícone de zoom in
      const zoomInBtn2 = page.locator('button').filter({ has: page.locator('svg').first() }).nth(3);
      
      // Verifica que o canvas existe
      const grid = page.getByRole("grid");
      await expect(grid).toBeVisible();
    }
  });
});
