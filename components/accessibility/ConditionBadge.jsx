import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Configuração visual por condição
 *
 * NUNCA exibe diagnóstico em texto visível no listão.
 * Apenas ícone (ponto colorido) + cor com tooltip no hover.
 */
const conditionConfig = {
  TEA: {
    label: "TEA",
    description: "Transtorno do Espectro Autista",
    dot: "bg-indigo-500",
    badge: "bg-indigo-50 border-indigo-200",
    text: "text-indigo-700",
  },
  TDAH: {
    label: "TDAH",
    description: "Déficit de Atenção com Hiperatividade",
    dot: "bg-amber-500",
    badge: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
  },
  TOD: {
    label: "TOD",
    description: "Transtorno Opositivo Desafiador",
    dot: "bg-orange-500",
    badge: "bg-orange-50 border-orange-200",
    text: "text-orange-700",
  },
  DISLEXIA: {
    label: "Dislexia",
    description: "Dificuldade específica em leitura/escrita",
    dot: "bg-teal-500",
    badge: "bg-teal-50 border-teal-200",
    text: "text-teal-700",
  },
  DISCALCULIA: {
    label: "Discalculia",
    description: "Dificuldade específica em matemática",
    dot: "bg-rose-500",
    badge: "bg-rose-50 border-rose-200",
    text: "text-rose-700",
  },
  ALTAS_HABILIDADES: {
    label: "AH/SD",
    description: "Altas Habilidades / Superdotação",
    dot: "bg-purple-500",
    badge: "bg-purple-50 border-purple-200",
    text: "text-purple-700",
  },
  OUTRO: {
    label: "NEE",
    description: "Necessidades Educacionais Especiais",
    dot: "bg-gray-500",
    badge: "bg-gray-50 border-gray-200",
    text: "text-gray-700",
  },
  NAO_INFORMADO: {
    label: "—",
    description: "Diagnóstico não informado",
    dot: "bg-gray-400",
    badge: "bg-gray-50 border-gray-200",
    text: "text-gray-600",
  },
};

/**
 * Badge de condição de neurodivergência
 *
 * DESIGN PRINCIPLE: NUNCA exibir diagnóstico em texto visível no listão.
 * Apenas ícone (ponto colorido) + tooltip no hover.
 *
 * @param {Object} props
 * @param {string|null} [props.condition] - DiagnosisType
 * @param {boolean} [props.showLabel=false] - Se true, exibe label abreviado
 * @param {'sm'|'md'|'lg'} [props.size='sm']
 */
export function ConditionBadge({ condition, showLabel = false, size = "sm" }) {
  if (!condition) return null;

  const config = conditionConfig[condition] || conditionConfig.OUTRO;

  const sizeClasses = {
    sm: "gap-1 px-1.5 py-0.5",
    md: "gap-1.5 px-2 py-1",
    lg: "gap-2 px-2.5 py-1.5",
  };

  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
  };

  const labelSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  const badgeContent = (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.badge,
        config.text,
        sizeClasses[size]
      )}
      role="status"
      aria-label={showLabel ? `${config.label}: ${config.description}` : config.description}
    >
      {/* Ponto colorido — indicador visual decorativo */}
      <span
        className={cn("rounded-full flex-shrink-0", config.dot, dotSizes[size])}
        aria-hidden="true"
      />

      {/* Label abreviado — apenas se showLabel = true */}
      {showLabel && (
        <span className={cn("font-medium", labelSizes[size])}>
          {config.label}
        </span>
      )}
    </span>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
