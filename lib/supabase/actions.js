/**
 * Server Actions — Autenticação Supabase
 *
 * Server Actions para uso em formulários server-side e route handlers.
 * Não usar em client components (use lib/supabase/client lá).
 *
 * Uso:
 *   "use server";
 *   import { signInWithGoogle, signOut, getCurrentUser } from "@/lib/supabase/actions";
 */

"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";

/**
 * Inicia fluxo de login com Google OAuth
 * Redireciona para o Google diretamente
 */
export async function signInWithGoogle() {
  const supabase = await createClient();

  if (!supabase) {
    throw new Error("Supabase não configurado");
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  // Redireciona para a URL de auth do Supabase
  if (data.url) {
    redirect(data.url);
  }
}

/**
 * Logout — encerra sessão e redireciona para /login
 */
export async function signOut() {
  const supabase = await createClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}

/**
 * Retorna o usuário autenticado atual + dados do professor do banco
 * @returns {Promise<{user: import('@supabase/supabase-js').User | null, teacher: Object | null}>}
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  if (!supabase) {
    return { user: null, teacher: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, teacher: null };
  }

  // Busca dados do professor no banco
  const teacher = await prisma.teacher.findUnique({
    where: { supabaseUserId: user.id },
  });

  return { user, teacher };
}

/**
 * Cria ou atualiza o registro do professor no banco
 * Chamado no primeiro login (callback OAuth)
 *
 * @param {import('@supabase/supabase-js').User} supabaseUser
 * @returns {Promise<Object>}
 */
export async function getOrCreateTeacher(supabaseUser) {
  const existing = await prisma.teacher.findUnique({
    where: { supabaseUserId: supabaseUser.id },
  });

  if (existing) {
    // Atualiza dados se mudou
    const updated = await prisma.teacher.update({
      where: { id: existing.id },
      data: {
        name: supabaseUser.user_metadata?.name || existing.name,
        email: supabaseUser.email || existing.email,
        school: supabaseUser.user_metadata?.school || existing.school,
      },
    });
    return updated;
  }

  // Cria novo professor
  const teacher = await prisma.teacher.create({
    data: {
      supabaseUserId: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || "Professor",
      email: supabaseUser.email || "",
      school: supabaseUser.user_metadata?.school || null,
      planType: "FREE",
    },
  });

  return teacher;
}
