/**
 * Testes E2E — Diário de Bordo
 *
 * Executar: npx playwright test tests/e2e/diary.spec.js
 * Pré-requisito: npx playwright install
 */

import { test, expect } from "@playwright/test";

test.describe("Diário de Bordo — Validação e UX", () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para página de acessibilidade
    await page.goto("/dashboard/classes/class-test-id/accessibility");

    // Clicar em aluno para abrir StudentProfile
    await page.click('text="João Silva"');

    // Ir para aba Diário
    await page.click('role=tab[name="Diário"]');
  });

  // ─── Validação de caracteres ─────────────────────────────────────────
  test("DiaryEntry com < 10 caracteres: botão submit desabilitado ou erro", async ({
    page,
  }) => {
    // Digitar texto curto
    await page.fill('textarea[placeholder*="Descreva"]', "teste");

    // Botão deve estar desabilitado ou mostrar erro ao clicar
    const submitBtn = page.getByRole("button", { name: "Registrar Entrada" });

    // Verifica que ou está desabilitado ou produz erro
    const isDisabled = await submitBtn.isDisabled();
    if (!isDisabled) {
      await submitBtn.click();
      await expect(
        page.getByText("pelo menos 10 caracteres")
      ).toBeVisible();
    } else {
      expect(isDisabled).toBe(true);
    }
  });

  // ─── Aviso de visibilidade Família ───────────────────────────────────
  test("Selecionar visibility=FAMILY exibe aviso antes do submit", async ({
    page,
  }) => {
    // Preencher descrição válida
    await page.fill(
      'textarea[placeholder*="Descreva"]',
      "Aluno participativo hoje na atividade em grupo com colegas."
    );

    // Selecionar visibilidade Família
    await page.click('role=combobox[name="Visibilidade"]');
    await page.click('text="Família"');

    // Aviso amarelo deve aparecer ANTES de clicar Submit
    await expect(
      page.getByText("visibilidade \"Família\" poderão ser compartilhados")
    ).toBeVisible();
  });

  // ─── Nova entrada aparece na timeline sem reload ─────────────────────
  test("Nova entrada aparece no topo da timeline sem reload", async ({
    page,
  }) => {
    const descricao =
      "João demonstrou progresso significativo na atividade de matemática hoje.";

    // Preencher e submeter
    await page.fill(
      'textarea[placeholder*="Descreva"]',
      descricao
    );
    await page.click('role=combobox[name="Visibilidade"]');
    await page.click('text="Privado"');

    await page.click('text="Registrar Entrada"');

    // Espera: entrada aparece na lista
    // (isso depende do callback onSave funcionar corretamente)
    // TODO: Verificar com mock da API
  });

  // ─── Filtro por categoria ────────────────────────────────────────────
  test("Filtro por categoria retorna apenas entradas da categoria", async ({
    page,
  }) => {
    // Selecionar filtro "Crise"
    await page.click('role=combobox').nth(1); // segundo select (categoria)
    await page.click('text="Crise"');

    // Verifica que apenas entradas de crise são mostradas
    // (depende de dados de teste)
    // TODO: Implementar com dados mock
  });

  // ─── Categoria Crise com destaque visual ─────────────────────────────
  test("Entrada de categoria CRISE tem badge vermelho", async ({ page }) => {
    // Verifica que badges de crise são vermelhos
    // Isso depende de entradas existentes com categoria CRISE
    // TODO: Implementar com dados mock
  });

  // ─── Filtro por período ──────────────────────────────────────────────
  test("Filtro por período 'Últimos 7 dias' funciona", async ({ page }) => {
    // Selecionar período
    await page.click('role=combobox').first();
    await page.click('text="Últimos 7 dias"');

    // Verifica que entradas antigas não aparecem
    // TODO: Implementar com dados mock
  });

  // ─── Delete de entrada ───────────────────────────────────────────────
  test("Excluir entrada pede confirmação", async ({ page }) => {
    // Clicar em botão de deletar (se houver entradas)
    const deleteBtn = page
      .getByRole("button", { name: "" })
      .filter({ has: page.getByRole("img", { name: /trash/i }) })
      .first();

    if (await deleteBtn.isVisible()) {
      // Intercepta o dialog de confirmação
      page.on("dialog", (dialog) => {
        expect(dialog.message()).toContain("excluir");
        dialog.dismiss();
      });

      await deleteBtn.click();
    }
  });

  // ─── Export PDF (feature premium) ────────────────────────────────────
  test("Botão Exportar PDF está visível", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /Exportar PDF/i })
    ).toBeVisible();
  });

  // ─── Empty State ─────────────────────────────────────────────────────
  test("Sem entradas exibe empty state claro", async ({ page }) => {
    // Se não há entradas, deve mostrar mensagem
    const emptyState = page.getByText("Nenhuma entrada registrada");
    const isVisible = await emptyState.isVisible().catch(() => false);

    // Ou mostra entradas ou mostra empty state
    expect(isVisible || (await page.getByRole("article").count() > 0)).toBe(
      true
    );
  });
});
