"use client";

import { useDraggable } from "@dnd-kit/core";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { ConditionBadge } from "@/components/accessibility/ConditionBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GripVertical, ShieldAlert } from "lucide-react";

/**
 * Card do aluno no mapa de sala — draggable
 *
 * PRIVACIDADE (LGPD): Se parentConsent = false, o diagnóstico é oculto.
 * Exibe apenas ícone neutro de "dados pendentes".
 *
 * @param {Object} props
 * @param {import('@/types').Student} props.student
 * @param {boolean} [props.compact]
 * @param {function} [props.onClick]
 */
export function StudentCardInner({ student, compact = false, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `student-${student.id}`,
      data: {
        type: "student",
        studentId: student.id,
        student,
      },
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition: isDragging ? "none" : "transform 150ms ease",
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  const firstName = student.name.split(" ")[0];

  const hasConsent = student.parentConsent !== false;

  // Tooltip: sem diagnóstico se sem consentimento
  const tooltipContent = (
    <div className="text-xs space-y-0.5">
      <p className="font-medium">{student.name}</p>
      {student.hasAccessibilityNeeds ? (
        hasConsent ? (
          student.diagnosisType && (
            <p className="text-muted-foreground">
              Diagnóstico: {student.diagnosisType.replace("_", " ")}
            </p>
          )
        ) : (
          <p className="text-amber-600 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" />
            Dados pendentes de consentimento do responsável
          </p>
        )
      ) : null}
      {student.prioritySeating && (
        <p className="text-mapi-primary">Assento prioritário</p>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            ref={setNodeRef}
            style={style}
            className={cn(
              "flex items-center gap-1.5 w-full h-full rounded-lg px-1.5 py-1",
              "bg-white border border-mapi-primary/30 shadow-sm",
              "cursor-grab active:cursor-grabbing select-none",
              "transition-shadow duration-150",
              isDragging && "ring-2 ring-mapi-primary ring-offset-1 shadow-lg"
            )}
            role="button"
            aria-label={`Aluno ${student.name}${student.hasAccessibilityNeeds ? " com necessidades de acessibilidade" : ""}`}
            aria-grabbed={isDragging}
            onClick={(e) => {
              if (!isDragging) {
                onClick?.(student);
              }
            }}
          >
            {/* Grip handle */}
            <div
              {...attributes}
              {...listeners}
              className="flex-shrink-0 text-muted-foreground/40 hover:text-muted-foreground/70 cursor-grab"
              aria-label={`Arrastar ${student.name}`}
            >
              <GripVertical className="w-3 h-3" />
            </div>

            {/* Nome truncado */}
            <span
              className={cn(
                "flex-1 font-medium truncate",
                compact ? "text-[10px]" : "text-xs"
              )}
              title={student.name}
            >
              {firstName}
            </span>

            {/* Badge: diagnóstico só com consentimento */}
            {student.hasAccessibilityNeeds && (
              hasConsent ? (
                <ConditionBadge
                  condition={student.diagnosisType}
                  showLabel={false}
                  size="sm"
                />
              ) : (
                /* Badge neutro — sem cor de condição */
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 border border-gray-200">
                        <ShieldAlert className="w-2.5 h-2.5 text-gray-400" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs max-w-[160px]">
                      Dados pendentes de consentimento do responsável
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * StudentCard memoizado — re-renderiza apenas quando o aluno muda.
 */
export const StudentCard = memo(StudentCardInner);
