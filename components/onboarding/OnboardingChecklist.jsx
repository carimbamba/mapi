"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Circle,
  X,
  Sparkles,
  Trophy,
  ArrowRight,
  Star,
} from "lucide-react";
import { ONBOARDING_STEPS } from "@/lib/actions/onboarding-steps";

/**
 * Checklist de Onboarding — Card flutuante no dashboard
 *
 * 5 passos com checkmarks animados, progress bar e celebração.
 * Descartável após completar.
 *
 * @param {Object} props
 * @param {number[]} props.completedSteps — IDs dos passos completados [1,2,3]
 * @param {number} props.percentage — 0 a 100
 * @param {boolean} props.allCompleted
 * @param {function} props.onCompleteStep — (stepId) => void
 * @param {function} props.onDismiss — () => void
 * @param {function} props.onAction — (action: string) => void
 */
export function OnboardingChecklist({
  completedSteps = [],
  percentage = 0,
  allCompleted = false,
  onCompleteStep,
  onDismiss,
  onAction,
}) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Quando todos os passos são completados, mostra celebração
  useEffect(() => {
    if (allCompleted && percentage === 100) {
      setShowCelebration(true);
      // Auto-dismiss após 5s
      const timer = setTimeout(() => {
        onDismiss?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [allCompleted, percentage]);

  if (dismissed) return null;

  return (
    <>
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-2xl animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Parabéns! 🎉
            </h2>
            <p className="text-muted-foreground mb-4">
              Você completou todos os passos do onboarding.
              <br />
              Sua sala de aula inclusiva está pronta!
            </p>
            <div className="flex gap-2 text-4xl justify-center mb-4">
              <Star className="w-8 h-8 text-yellow-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <Star className="w-8 h-8 text-yellow-400 animate-bounce" style={{ animationDelay: "200ms" }} />
              <Star className="w-8 h-8 text-yellow-400 animate-bounce" style={{ animationDelay: "400ms" }} />
            </div>
            <Button
              onClick={() => {
                setShowCelebration(false);
                onDismiss?.();
              }}
              className="bg-mapi-primary hover:bg-mapi-primary/90"
            >
              Começar a usar o MAPI
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Checklist card */}
      <Card className="border-mapi-primary/20 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-mapi-primary" />
              Primeiros Passos
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onDismiss}
              aria-label="Fechar checklist"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-sm">
            {allCompleted
              ? "Tudo completo! 🎉"
              : `${percentage}% completo — continue assim!`}
          </CardDescription>

          {/* Progress bar */}
          <Progress value={percentage} className="h-2" />
        </CardHeader>

        <CardContent className="space-y-2">
          {ONBOARDING_STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id);

            return (
              <div
                key={step.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Checkmark */}
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-mapi-success animate-in fade-in zoom-in duration-300" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground/40" />
                  )}
                </div>

                {/* Step info */}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCompleted
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Action button */}
                {!isCompleted && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-shrink-0 h-7 text-xs"
                    onClick={() => {
                      onCompleteStep?.(step.id);
                      onAction?.(step.action);
                    }}
                  >
                    Fazer
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            );
          })}

          {/* Skip */}
          {!allCompleted && (
            <div className="pt-2 text-center">
              <button
                onClick={onDismiss}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Fazer isso depois →
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
