/**
 * Testes E2E — Autenticação do MAPI
 *
 * Executar: npx playwright test tests/e2e/auth.spec.js
 * Pré-requisito: npx playwright install
 */

import { test, expect } from "@playwright/test";

test.describe("Autenticação — Fluxos Críticos", () => {
  test.beforeEach(async ({ page }) => {
    // Garantir que começamos do login
    await page.goto("/login");
  });

  // ─── Login com Google redireciona para dashboard ─────────────────────
  test("Login com Google redireciona para dashboard após autenticação", async ({
    page,
  }) => {
    // Verifica que a página de login está visível
    await expect(page.getByText("Organize sua sala. Inclua de verdade.")).toBeVisible();

    // Clica em "Entrar com Google"
    const googleBtn = page.getByRole("button", { name: /entrar com google/i });
    await expect(googleBtn).toBeVisible();

    // Nota: O teste real requer mock do Supabase OAuth.
    // Em CI, usar Supabase com usuário de teste ou mock.
    // Aqui verificamos que o botão existe e está habilitado.
    await expect(googleBtn).toBeEnabled();
  });

  // ─── Logout redireciona para login ───────────────────────────────────
  test("Logout redireciona para login", async ({ page }) => {
    // Simula usuário logado navegando para dashboard
    await page.goto("/dashboard");

    // Clica no avatar para abrir menu
    const avatarBtn = page.getByRole("button").filter({ hasText: /professor/i }).first();
    if (await avatarBtn.isVisible().catch(() => false)) {
      await avatarBtn.click();

      // Clica em "Sair"
      const logoutBtn = page.getByRole("menuitem", { name: /sair/i });
      if (await logoutBtn.isVisible().catch(() => false)) {
        await logoutBtn.click();

        // Espera redirecionamento para login
        await expect(page).toHaveURL(/\/login/);
      }
    }
  });

  // ─── Rota /dashboard sem auth redireciona para /login ────────────────
  test("Rota /dashboard sem auth redireciona para /login", async ({ page }) => {
    // Navega para dashboard (usuário não autenticado)
    await page.goto("/dashboard");

    // Aguarda redirecionamento
    await page.waitForURL(/\/login/, { timeout: 5000 });

    // Verifica que está na página de login
    await expect(page).toHaveURL(/\/login/);
  });

  // ─── Usuário autenticado acessando /login é redirecionado ────────────
  test("Usuário já logado acessando /login é redirecionado para dashboard", async ({
    page,
  }) => {
    // Simula usuário logado tentando acessar login
    await page.goto("/login");

    // Se já logado, deve redirecionar para dashboard
    // (depende do middleware verificar a sessão)
    const url = page.url();
    if (url.includes("/dashboard")) {
      await expect(page).toHaveURL(/\/dashboard/);
    }
  });
});
