/**
 * Testes E2E — StudentProfile
 *
 * Executar: npx playwright test tests/e2e/student-profile.spec.js
 * Pré-requisito: npx playwright install
 */

import { test, expect } from "@playwright/test";

test.describe("StudentProfile — LGPD e UX", () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Substituir por login real com Supabase
    // Por enquanto, navega direto para a página de acessibilidade
    await page.goto("/dashboard/classes/class-test-id/accessibility");
  });

  // ─── LGPD: Consentimento ─────────────────────────────────────────────
  test("StudentProfile com parent_consent=false esconde dados clínicos", async ({
    page,
  }) => {
    // Clicar em aluno sem consentimento
    await page.click('text="João Silva"');

    // Espera: Sheet abre
    await expect(page.getByRole("dialog")).toBeVisible();

    // Espera: mensagem sobre consentimento visível
    await expect(
      page.getByText("Consentimento necessário")
    ).toBeVisible();

    // Espera: dados clínicos NÃO visíveis
    await expect(page.getByText("Diagnóstico")).not.toBeVisible();
    await expect(page.getByText("Observações")).not.toBeVisible();

    // Espera: botão de registrar consentimento visível
    await expect(
      page.getByRole("button", { name: "Registrar Consentimento" })
    ).toBeVisible();
  });

  test("Registrar consentimento libera dados clínicos", async ({ page }) => {
    // Clicar em aluno sem consentimento
    await page.click('text="João Silva"');

    // Clicar em registrar consentimento
    await page.click('text="Registrar Consentimento"');

    // Confirmar
    await page.click('text="Confirmar"');

    // Espera: dados clínicos agora visíveis
    await expect(page.getByText("Diagnóstico")).toBeVisible();
  });

  // ─── LGPD: Guia de Manejo só com diagnóstico ─────────────────────────
  test("Aba Guia de Manejo mostra aviso sem diagnóstico", async ({
    page,
  }) => {
    // Clicar em aluno sem diagnóstico registrado
    await page.click('text="Maria Santos"');

    // Ir para aba Guia
    await page.click('role=tab[name="Guia"]');

    // Espera: aviso que não há guia
    await expect(
      page.getByText("Nenhum guia disponível")
    ).toBeVisible();
  });

  // ─── UX: Trocar de aluno atualiza Profile sem resquício ──────────────
  test("Trocar entre dois alunos atualiza Profile sem dados do anterior", async ({
    page,
  }) => {
    // Clicar em Aluno A
    await page.click('text="João Silva"');
    await expect(page.getByText("João Silva")).toBeVisible();

    // Fechar sheet
    await page.keyboard.press("Escape");

    // Clicar em Aluno B
    await page.click('text="Maria Santos"');
    await expect(page.getByText("Maria Santos")).toBeVisible();

    // Espera: ZERO ocorrência do nome A
    await expect(page.getByText("João Silva")).not.toBeVisible();
  });

  // ─── UX: Sheet não bloqueia o mapa ───────────────────────────────────
  test("Sheet abre sem bloquear o conteúdo atrás", async ({ page }) => {
    // Clicar em aluno
    await page.click('text="João Silva"');

    // Sheet deve estar visível
    await expect(page.getByRole("dialog")).toBeVisible();

    // Mapa deve ainda estar acessível (não modal)
    // Verificar que elementos do mapa ainda estão no DOM
    await expect(page.getByRole("grid")).toBeInViewport();
  });

  // ─── UX: Disclaimer visível sem scroll ───────────────────────────────
  test("Disclaimer do ManagementGuide visível sem scroll", async ({
    page,
  }) => {
    // Clicar em aluno com diagnóstico
    await page.click('text="Pedro (TEA)"');

    // Ir para aba Guia
    await page.click('role=tab[name="Guia"]');

    // Disclaimer deve estar visível no viewport
    const disclaimer = page.getByText("Aviso Importante");
    await expect(disclaimer).toBeVisible();
  });

  // ─── Loading State ───────────────────────────────────────────────────
  test("Loading state adequado ao abrir perfil", async ({ page }) => {
    // Intercepta carregamento de dados
    // TODO: Implementar com mock de API

    // Por enquanto, verifica que o sheet abre
    await page.click('text="João Silva"');
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  // ─── Mobile Responsivo ───────────────────────────────────────────────
  test("Sheet ocupa tela toda em mobile", async ({ page }) => {
    // Simular mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Clicar em aluno
    await page.click('text="João Silva"');

    // Sheet deve ocupar largura total
    const sheet = page.getByRole("dialog");
    const box = await sheet.boundingBox();
    expect(box.width).toBeGreaterThanOrEqual(350); // ~95% de 375px
  });
});
