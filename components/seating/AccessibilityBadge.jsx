import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Brain, Eye, Ear, accessibility } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Badge discreto de acessibilidade para alunos
 * @param {Object} props
 * @param {string|null} props.diagnosisType
 * @param {'sm'|'md'} [props.size='md']
 */
export function AccessibilityBadge({ diagnosisType, size = "md" }) {
  if (!diagnosisType) return null;

  const config = {
    TEA: {
      label: "TEA",
      color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      description: "Transtorno do Espectro Autista",
    },
    TDAH: {
      label: "TDAH",
      color: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      description: "Déficit de Atenção com Hiperatividade",
    },
    TOD: {
      label: "TOD",
      color: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      description: "Transtorno Opositivo Desafiador",
    },
    Dislexia: {
      label: "Dxl",
      color: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      description: "Dislexia",
    },
    AltasHabilidades: {
      label: "AH/SD",
      color: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
      description: "Altas Habilidades / Superdotação",
    },
  };

  const { label, color, description } = config[diagnosisType] || {
    label: "NEE",
    color: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    description: "Necessidades Educacionais Especiais",
  };

  const badgeContent = (
    <Badge
      variant="secondary"
      className={cn(
        "cursor-default font-medium border-0",
        color,
        size === "sm" ? "text-[9px] px-1 py-0" : "text-xs px-1.5 py-0"
      )}
    >
      {label}
    </Badge>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
