"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

/**
 * Error Boundary — Página de erro para rotas do App Router
 *
 * Exibido quando um erro é lançado dentro de um route segment.
 * Oferece opção de recarregar ou voltar ao dashboard.
 *
 * @param {Object} props
 * @param {Error} props.error
 * @param {function} props.reset
 */
export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log do erro para monitoramento
    console.error("[MAPI Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-mapi-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <CardTitle>Algo deu errado</CardTitle>
          <CardDescription>
            Ocorreu um erro inesperado. Tente recarregar a página.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={() => reset()} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Recarregar página
          </Button>
          <Link href="/dashboard" className="block">
            <Button variant="outline" className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 p-3 bg-muted rounded text-xs font-mono overflow-auto max-h-32">
              <summary className="cursor-pointer font-sans font-medium text-muted-foreground">
                Detalhes do erro (desenvolvimento)
              </summary>
              <pre className="mt-2 text-red-600 whitespace-pre-wrap">
                {error.message}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
