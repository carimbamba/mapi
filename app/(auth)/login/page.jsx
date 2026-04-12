"use client";

import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Página de Login — MAPI
 *
 * - Botão "Entrar com Google" via Supabase OAuth
 * - Tagline: "Organize sua sala. Inclua de verdade."
 * - Loading state + tratamento de erro
 */
function LoginPageContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /**
   * Login com Google OAuth via Supabase
   */
  async function handleGoogleLogin() {
    if (!supabase) {
      setError("Supabase não configurado. Verifique as variáveis de ambiente.");
      return;
    }

    setLoading(true);
    setError("");

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-mapi-background via-white to-mapi-background/50 p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="text-center pb-6">
          {/* Logo MAPI */}
          <div className="w-16 h-16 bg-mapi-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">MAPI</CardTitle>
          <CardDescription className="text-base mt-1">
            Organize sua sala. Inclua de verdade.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Erro */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Botão Google */}
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-12 text-base font-medium bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 shadow-sm transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Redirecionando...
              </>
            ) : (
              <>
                {/* Google Icon */}
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Entrar com Google
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Acesso via Google Workspace
              </span>
            </div>
          </div>

          {/* Info */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed">
            Ao entrar, você concorda com os Termos de Uso e a Política de Privacidade do MAPI.
            Seus dados são protegidos conforme a LGPD.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Login Page com Suspense boundary para useSearchParams
 */
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-mapi-background via-white to-mapi-background/50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-mapi-primary mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Carregando...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
