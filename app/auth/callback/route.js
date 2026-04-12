/**
 * OAuth Callback Route Handler
 *
 * Processa o callback do Supabase após login com Google.
 * Troca o code pela sessão e redireciona para o dashboard.
 *
 * URL esperada: /auth/callback?code=xxx&redirect=/dashboard
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getOrCreateTeacher } from "@/lib/supabase/actions";

/**
 * GET /auth/callback
 * @param {Request} request
 */
export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirect = requestUrl.searchParams.get("redirect") || "/dashboard";
  const next = requestUrl.searchParams.get("next") || redirect;

  if (!code) {
    // Sem code — redireciona para login com erro
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "missing_code");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();

  if (!supabase) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "supabase_not_configured");
    return NextResponse.redirect(loginUrl);
  }

  // Troca o code pela sessão
  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    console.error("[Auth Callback] Session exchange error:", sessionError.message);
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "session_exchange_failed");
    return NextResponse.redirect(loginUrl);
  }

  // Obtém o usuário
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("error", "user_not_found");
    return NextResponse.redirect(loginUrl);
  }

  // Cria ou atualiza o registro do professor no banco
  try {
    await getOrCreateTeacher(user);
  } catch (err) {
    console.error("[Auth Callback] Error creating teacher:", err);
    // Não bloqueia o login — o teacher pode ser criado depois
  }

  // Redireciona para o destino
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
