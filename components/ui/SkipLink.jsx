"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Skip Link — Link de acessibilidade para pular navegação
 *
 * Aparece apenas quando o usuário usa Tab no início da página.
 * Permite pular diretamente para o conteúdo principal.
 * WCAG 2.1 AA — Skip Navigation
 */
export function SkipLink() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Mostra quando Tab é pressionado
      if (e.key === "Tab") {
        setVisible(true);
      }
      // Esconde quando clica ou move o mouse
      const hide = () => setVisible(false);
      window.addEventListener("mousedown", hide, { once: true });
      return () => window.removeEventListener("mousedown", hide);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <a
      href="#main-content"
      className={cn(
        "sr-only focus:not-sr-only",
        "fixed top-4 left-4 z-[100] px-4 py-3",
        "bg-mapi-primary text-white font-medium rounded-lg shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-mapi-primary focus:ring-offset-2",
        "transition-all duration-200",
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      Pular para o conteúdo principal
    </a>
  );
}
