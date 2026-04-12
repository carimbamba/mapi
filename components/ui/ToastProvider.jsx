"use client";

import { Toaster } from "react-hot-toast";

/**
 * Toast Provider — Configuração global de notificações
 *
 * Padrões:
 * - Sucesso: verde #6BAE75, ícone check, 3 segundos
 * - Erro: vermelho suave, ícone X, 5 segundos, ação "Tentar novamente"
 * - Loading: spinner, sem auto-dismiss
 * - Mensagens em português BR
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{
        // Default
        duration: 4000,
        style: {
          background: "#FFFFFF",
          color: "#1E293B",
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          fontSize: "14px",
          fontFamily: "var(--font-geist-sans, sans-serif)",
        },

        // Sucesso
        success: {
          duration: 3000,
          iconTheme: {
            primary: "#6BAE75",
            secondary: "#FFFFFF",
          },
          style: {
            border: "1px solid #6BAE75/30",
          },
        },

        // Erro
        error: {
          duration: 5000,
          iconTheme: {
            primary: "#EF4444",
            secondary: "#FFFFFF",
          },
          style: {
            border: "1px solid #EF4444/30",
          },
        },

        // Loading
        loading: {
          duration: Infinity,
          iconTheme: {
            primary: "#4A7C9E",
            secondary: "#FFFFFF",
          },
        },
      }}
    />
  );
}
