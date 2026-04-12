"use client";

import { useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Trophy,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Relatório pós-geração do mapa
 *
 * Mostra score, warnings e opções de ação.
 * Animação de confetti se score >= 85.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onOpenChange
 * @param {number} [props.score=0]
 * @param {string[]} [props.warnings=[]]
 * @param {number} [props.placementCount=0]
 * @param {number} [props.totalStudents=0]
 * @param {function} [props.onAccept]
 * @param {function} [props.onRegenerate]
 * @param {boolean} [props.regenerating=false]
 */
export function GenerationReport({
  open,
  onOpenChange,
  score = 0,
  warnings = [],
  placementCount = 0,
  totalStudents = 0,
  onAccept,
  onRegenerate,
  regenerating = false,
}) {
  const hasConfetti = useRef(false);

  // Score tiers
  const isExcellent = score >= 85;
  const isGood = score >= 65 && score < 85;
  const isFair = score >= 40 && score < 65;
  const isPoor = score < 40;

  // Confetti on open (excellent score)
  useEffect(() => {
    if (open && isExcellent && !hasConfetti.current) {
      hasConfetti.current = true;
      triggerConfetti();
    }
    if (!open) {
      hasConfetti.current = false;
    }
  }, [open, isExcellent]);

  /**
   * Dispara animação de confetti
   */
  function triggerConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ["#4A7C9E", "#6BAE75", "#E8A838"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 65,
        startVelocity: 50,
        origin: { x: 0, y: 0.8 },
        colors,
        gravity: 0.8,
        drift: 0.5,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 65,
        startVelocity: 50,
        origin: { x: 1, y: 0.8 },
        colors,
        gravity: 0.8,
        drift: -0.5,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }

  /**
   * Score icon and color
   */
  function getScoreConfig() {
    if (isExcellent) {
      return {
        color: "text-mapi-success",
        bg: "bg-mapi-success/10",
        icon: <Trophy className="w-6 h-6 text-mapi-success" />,
        label: "Excelente!",
        message: "O algoritmo encontrou uma solução ótima para sua turma.",
      };
    }
    if (isGood) {
      return {
        color: "text-blue-600",
        bg: "bg-blue-50",
        icon: <CheckCircle2 className="w-6 h-6 text-blue-600" />,
        label: "Bom",
        message: "A solução é boa, mas pode haver ajustes manuais.",
      };
    }
    if (isFair) {
      return {
        color: "text-mapi-warning",
        bg: "bg-amber-50",
        icon: <AlertTriangle className="w-6 h-6 text-mapi-warning" />,
        label: "Razoável",
        message: "Algumas regras não puderam ser satisfeitas.",
      };
    }
    return {
      color: "text-red-500",
      bg: "bg-red-50",
      icon: <AlertCircle className="w-6 h-6 text-red-500" />,
      label: "Precisa melhorar",
      message: "Muitas restrições conflitantes. Considere revisar as regras.",
    };
  }

  const config = getScoreConfig();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-mapi-primary" />
            Resultado da Geração
          </DialogTitle>
          <DialogDescription>
            O algoritmo processou {totalStudents} alunos e gerou o mapa abaixo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Score */}
          <div className={cn("rounded-xl p-5 text-center", config.bg)}>
            <div className="flex justify-center mb-2">{config.icon}</div>
            <div className={cn("text-4xl font-bold", config.color)}>
              {score}
              <span className="text-lg font-normal">/100</span>
            </div>
            <p className={cn("text-sm font-semibold mt-1", config.color)}>
              {config.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {config.message}
            </p>

            {/* Score bar */}
            <div className="mt-3 h-2 bg-white/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  isExcellent && "bg-mapi-success",
                  isGood && "bg-blue-500",
                  isFair && "bg-mapi-warning",
                  isPoor && "bg-red-500"
                )}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">
                {placementCount}
              </p>
              <p className="text-xs text-muted-foreground">
                Alunos posicionados
              </p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-foreground">
                {totalStudents - placementCount}
              </p>
              <p className="text-xs text-muted-foreground">Sem posição</p>
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-semibold text-amber-700">
                  {warnings.length} aviso{warnings.length > 1 ? "s" : ""}
                </h4>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 max-h-36 overflow-y-auto">
                <ul className="space-y-1">
                  {warnings.slice(0, 5).map((warning, i) => (
                    <li
                      key={i}
                      className="text-xs text-amber-700 flex items-start gap-1.5"
                    >
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{warning}</span>
                    </li>
                  ))}
                  {warnings.length > 5 && (
                    <li className="text-xs text-muted-foreground pl-5">
                      ...e mais {warnings.length - 5} avisos
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {warnings.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-xs text-green-700">
                Todas as regras foram satisfeitas!
              </p>
            </div>
          )}
        </div>

        <Separator />

        <DialogFooter className="flex gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onRegenerate?.()}
            disabled={regenerating}
          >
            <RefreshCw
              className={cn(
                "w-4 h-4 mr-1.5",
                regenerating && "animate-spin"
              )}
            />
            {regenerating ? "Gerando..." : "Gerar Novamente"}
          </Button>
          <Button
            onClick={() => onAccept?.()}
            className="bg-mapi-primary hover:bg-mapi-primary/90 flex-1"
          >
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Aceitar Mapa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
