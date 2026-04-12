/**
 * MAPI — Middleware de Autenticação
 *
 * Responsabilidades:
 * 1. Refresh da sessão Supabase em cada request
 * 2. Proteção de rotas do dashboard — redireciona para /login se não autenticado
 * 3. Redireciona / e /login para /dashboard se já autenticado
 *
 * Fluxo:
 *   Requisição → Middleware → Refresh Session → Verifica auth → Redireciona ou continua
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * @param {import('next/server').NextRequest} request
 * @returns {Promise<import('next/server').NextResponse>}
 */
export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh da sessão — obrigatório para manter cookies válidos
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // ─── Rotas protegidas (dashboard) ──────────────────────────────────────
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (isDashboardRoute && !session) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ─── Rotas de auth já logado ──────────────────────────────────────────
  const isAuthRoute =
    pathname === "/login" || pathname === "/register";

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ─── Landing page já logado ───────────────────────────────────────────
  if (pathname === "/" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (public files)
     * - public folder files (svg, png, jpg, etc.)
     * - API routes que não precisam de auth no middleware
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
