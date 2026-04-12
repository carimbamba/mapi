/**
 * Supabase Server Client
 *
 * Cria instância do Supabase para uso em Server Components e Route Handlers.
 * Usa createServerClient do @supabase/ssr com integração de cookies do Next.js.
 *
 * Uso em Server Component:
 *   import { createClient } from "@/lib/supabase/server";
 *   const supabase = await createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *
 * Uso em Route Handler:
 *   import { createClient } from "@/lib/supabase/server";
 *   import { cookies } from "next/headers";
 *   const supabase = await createClient();
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cria cliente Supabase para uso no servidor
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient | null>}
 */
export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Retorna null durante build quando env vars não estão definidas
  if (!url || !key || !url.startsWith("http")) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Em Server Components, setAll não é suportado pelo Next.js
          // O middleware cuidará da persistência dos cookies
        }
      },
    },
  });
}
