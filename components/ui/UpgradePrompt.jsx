"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Star, ArrowRight, X, Sparkles } from "lucide-react";

/**
 * Upgrade Prompt — aparece quando recurso premium é bloqueado
 *
 * Mostra o recurso "atrás de vidro" com overlay suave.
 * Duas variantes: inline (dentro do componente) e modal.
 *
 * @param {Object} props
 * @param {'inline'|'modal'} [props.variant='inline']
 * @param {string} [props.title]
 * @param {string} [props.description]
 * @param {string} [props.featureName] — nome da feature bloqueada
 * @param {function} [props.onClose] — para fechar modal
 * @param {string} [props.upgradeUrl] — URL para página de planos
 */
export function UpgradePrompt({
  variant = "inline",
  title,
  description,
  featureName,
  onClose,
  upgradeUrl = "/login?upgrade=true",
}) {
  const defaultTitle = featureName
    ? `${featureName} é do plano Premium`
    : "Recurso Premium";
  const defaultDescription =
    "Este recurso está disponível nos planos Premium e Escola. Faça upgrade para desbloquear.";

  const content = (
    <>
      {/* Glass overlay / card */}
      <div
        className={`
          relative overflow-hidden rounded-xl border
          ${variant === "modal" ? "bg-white/80 backdrop-blur-sm" : "bg-white/60 backdrop-blur-sm"}
        `}
      >
        {/* Glass pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-mapi-primary/5 via-transparent to-mapi-primary/5 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 10px, #4A7C9E 10px, #4A7C9E 11px)",
          }}
        />

        <Card className="relative border-0 shadow-none bg-transparent">
          <CardHeader className="text-center pb-4">
            {variant === "modal" && onClose && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="w-12 h-12 bg-mapi-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-mapi-primary" />
            </div>

            <CardTitle className="text-lg">{title || defaultTitle}</CardTitle>
            <CardDescription>
              {description || defaultDescription}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                "Geração automática por IA",
                "Diário de Bordo",
                "Guias de Manejo",
                "Exportação PDF",
                "Compartilhar com substituto",
                "Perfis completos",
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-muted-foreground"
                >
                  <Star className="w-3 h-3 text-mapi-primary flex-shrink-0" />
                  <span className="truncate">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex gap-2 pt-2">
              <a
                href={upgradeUrl}
                className="flex-1"
              >
                <Button
                  className="w-full bg-mapi-primary hover:bg-mapi-primary/90"
                  size="sm"
                >
                  Ver planos
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </a>
              {variant === "modal" && onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  Depois
                </Button>
              )}
            </div>

            {/* Badge */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3 text-mapi-primary" />
                A partir de R$ 19,90/mês
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="w-full max-w-md">{content}</div>
      </div>
    );
  }

  return content;
}

/**
 * Mini UpgradePrompt — versão compacta para inserir dentro de cards/lists
 *
 * @param {Object} props
 * @param {string} [props.featureName]
 * @param {string} [props.upgradeUrl]
 */
export function UpgradePromptMini({
  featureName,
  upgradeUrl = "/login?upgrade=true",
}) {
  return (
    <a href={upgradeUrl} className="block">
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30 hover:border-mapi-primary/50 transition-colors cursor-pointer group">
        <div className="w-8 h-8 bg-mapi-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Lock className="w-4 h-4 text-mapi-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">
            {featureName || "Recurso Premium"}
          </p>
          <p className="text-xs text-muted-foreground">
            Faça upgrade para desbloquear →
          </p>
        </div>
      </div>
    </a>
  );
}
