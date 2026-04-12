"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Configuração dos passos do tooltip guide
 */
const TOOLTIP_STEPS = [
  {
    id: 1,
    targetSelector: '[data-onboarding="new-class"]',
    title: "Comece criando sua turma",
    description: "Clique aqui para criar sua primeira turma.",
    placement: "bottom",
  },
  {
    id: 2,
    targetSelector: '[data-onboarding="add-students"]',
    title: "Adicione seus alunos",
    description: "Cadastre manualmente ou importe uma lista CSV.",
    placement: "bottom",
  },
  {
    id: 3,
    targetSelector: '[data-onboarding="view-map"]',
    title: "Monte o mapa da sua sala",
    description: "Arraste alunos ou gere automaticamente.",
    placement: "left",
  },
  {
    id: 4,
    targetSelector: '[data-onboarding="accessibility"]',
    title: "Registre necessidades especiais",
    description: "Marque TEA, TDAH e acesse guias de manejo.",
    placement: "left",
  },
];

/**
 * Tooltip Guide — Sequência de tooltips contextuais no primeiro acesso
 *
 * Aparece como spotlight + tooltip apontando para elementos da UI.
 * Estado salvo no banco (teacher.lastTooltipStep).
 *
 * @param {Object} props
 * @param {boolean} props.active
 * @param {number} props.currentStep — 1 a 4
 * @param {function} props.onNextStep — (step) => void
 * @param {function} props.onSkip — () => void
 */
export function TooltipGuide({ active, currentStep = 1, onNextStep, onSkip }) {
  const [visible, setVisible] = useState(false);
  const [tooltipRect, setTooltipRect] = useState(null);
  const tooltipRef = useRef(null);

  const step = TOOLTIP_STEPS.find((s) => s.id === currentStep);

  // Posiciona o tooltip ao clicar no elemento alvo
  useEffect(() => {
    if (!active || !step) {
      setVisible(false);
      return;
    }

    // Pequeno delay para o elemento alvo estar no DOM
    const timer = setTimeout(() => {
      const target = document.querySelector(step.targetSelector);
      if (target) {
        const rect = target.getBoundingClientRect();
        setTooltipRect(rect);
        setVisible(true);

        // Scroll para o elemento se necessário
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setVisible(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [active, step]);

  if (!active || !visible || !tooltipRect || !step) return null;

  // Calcula posição do tooltip
  const tooltipWidth = 320;
  const spacing = 12;

  let left = tooltipRect.left + tooltipRect.width / 2 - tooltipWidth / 2;
  let top = tooltipRect.bottom + spacing;

  // Garante que o tooltip não saia da tela
  left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));

  // Spotlight overlay
  return (
    <>
      {/* Dark overlay com spotlight */}
      <div
        className="fixed inset-0 z-40 pointer-events-none"
        style={{
          background: `radial-gradient(circle 60px at ${
            tooltipRect.left + tooltipRect.width / 2
          }px ${
            tooltipRect.top + tooltipRect.height / 2
          }px, transparent 50px, rgba(0,0,0,0.6) 150px)`,
        }}
      />

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className={cn(
          "fixed z-50 bg-white rounded-xl shadow-2xl border p-5 max-w-xs",
          "animate-in fade-in slide-in-from-bottom-4 duration-300"
        )}
        style={{
          left: `${left}px`,
          top: `${top}px`,
          width: `${tooltipWidth}px`,
        }}
        role="dialog"
        aria-label={`Passo ${step.id} do onboarding`}
      >
        {/* Arrow pointer */}
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t rotate-45"
          style={{
            left: `${
              tooltipRect.left +
              tooltipRect.width / 2 -
              left +
              window.scrollX
            }px`,
          }}
        />

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 bg-mapi-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-mapi-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {step.description}
            </p>
          </div>
          <button
            onClick={onSkip}
            className="p-1 rounded hover:bg-muted transition-colors flex-shrink-0"
            aria-label="Pular onboarding"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-3">
          {TOOLTIP_STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                s.id <= currentStep ? "bg-mapi-primary" : "bg-muted"
              )}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">
            {currentStep}/{TOOLTIP_STEPS.length}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs"
            onClick={onSkip}
          >
            Pular
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-mapi-primary hover:bg-mapi-primary/90 text-xs"
            onClick={() => onNextStep(currentStep)}
          >
            Entendi
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>
    </>
  );
}

/**
 * Hook para usar o Tooltip Guide com estado
 *
 * @param {Object} options
 * @param {number} options.initialStep
 * @param {function} options.onStepComplete
 * @param {function} options.onSkip
 * @returns {{ active: boolean, currentStep: number, nextStep: () => void, skip: () => void }}
 */
export function useTooltipGuide({ initialStep = 1, onStepComplete, onSkip } = {}) {
  const [active, setActive] = useState(initialStep <= 4);
  const [currentStep, setCurrentStep] = useState(initialStep);

  const nextStep = () => {
    if (currentStep >= 4) {
      setActive(false);
      onStepComplete?.(currentStep);
      return;
    }
    onStepComplete?.(currentStep);
    setCurrentStep((s) => s + 1);
  };

  const skip = () => {
    setActive(false);
    onSkip?.();
  };

  return { active, currentStep, nextStep, skip };
}
