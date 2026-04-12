/**
 * Supabase Browser Client
 *
 * Cria instância do Supabase para uso no client-side (React Components, hooks).
 * Usa createBrowserClient do @supabase/ssr para integração correta com cookies.
 *
 * Uso:
 *   import { createClient } from "@/lib/supabase/client";
 *   const supabase = createClient();
 *   const { data } = await supabase.auth.getSession();
 */

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cria cliente Supabase para uso no browser
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Retorna null durante build quando env vars não estão definidas
  if (!url || !key || !url.startsWith("http")) {
    return null;
  }

  return createBrowserClient(url, key);
}
