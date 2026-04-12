"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * Global Error Boundary — Para erros no root layout
 *
 * Este componente é renderizado quando o erro ocorre no layout raiz.
 * Diferente de error.jsx, este pode capturar erros de metadata e fonts.
 */
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("[MAPI Global Error]", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-mapi-background p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle>Erro Crítico</CardTitle>
              <CardDescription>
                Um erro grave ocorreu. Recarregue a página ou tente novamente mais tarde.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => reset()} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Recarregar
              </Button>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}
