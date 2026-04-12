"use client";

import { useDroppable } from "@dnd-kit/core";
import { memo } from "react";
import { cn } from "@/lib/utils";

/**
 * Célula de mesa/cadeira no mapa de sala
 *
 * Estados visuais:
 * - Vazia: borda tracejada, clicável para receber drop
 * - Ocupada: card do aluno (renderizado pelo pai)
 * - Bloqueada: cinza, não interativa
 * - Drag over: highlight mapi-primary
 *
 * React.memo: evita re-render quando props não mudam.
 *
 * @param {Object} props
 * @param {string} props.deskId — identificador único (ex: "A1", "B3")
 * @param {number} props.x
 * @param {number} props.y
 * @param {boolean} [props.isBlocked]
 * @param {boolean} [props.isAisle]
 * @param {React.ReactNode} [props.children] — StudentCard ou null
 * @param {boolean} [props.isDragOver]
 */
function DeskCellInner({
  deskId,
  x,
  y,
  isBlocked = false,
  isAisle = false,
  children,
  isDragOver = false,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `desk-${deskId}`,
    disabled: isBlocked,
    data: {
      deskId,
      type: "desk",
    },
  });

  const occupied = !!children;

  return (
    <div
      ref={setNodeRef}
      style={{
        gridColumnStart: 1,
      }}
      tabIndex={isBlocked ? -1 : 0}
      className={cn(
        "relative w-20 h-16 rounded-lg border-2 transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mapi-primary focus-visible:ring-offset-1",
        // Bloqueado
        isBlocked && "bg-gray-100 border-gray-200 cursor-not-allowed opacity-50",
        // Vazio
        !occupied && !isBlocked && "border-dashed border-gray-300 bg-surface hover:border-mapi-primary/50 hover:bg-mapi-primary/5",
        // Drag over
        isDragOver && !isBlocked && !occupied && "border-mapi-primary bg-mapi-primary/10 border-solid ring-2 ring-mapi-primary/30",
        // Ocupado
        occupied && "border-mapi-primary/60 bg-mapi-primary/5 shadow-sm hover:shadow-md",
        // Corredor (indicador sutil)
        isAisle && !occupied && !isBlocked && "border-l-4 border-l-amber-300/50"
      )}
      role="gridcell"
      aria-label={`Mesa ${deskId}${isBlocked ? " (bloqueada)" : occupied ? " (ocupada)" : " (vazia)"}`}
    >
      {/* Label da posição */}
      <div className="absolute -top-2 -left-1 text-[9px] text-muted-foreground bg-background px-0.5 rounded border border-gray-100 font-mono z-10">
        {deskId}
      </div>

      {/* Conteúdo (aluno) ou placeholder */}
      {children ? (
        <div className="flex items-center justify-center h-full p-1">
          {children}
        </div>
      ) : !isBlocked ? (
        <div className="flex items-center justify-center h-full">
          <span className="text-[10px] text-muted-foreground/40">Vazio</span>
        </div>
      ) : null}

      {/* Indicador de corredor */}
      {isAisle && !isBlocked && (
        <div className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 bg-amber-400/60 rounded-full" title="Corredor" />
      )}
    </div>
  );
}

/**
 * DeskCell memoizado — re-renderiza apenas quando props mudam.
 * Evita re-render de todas as ~30+ células a cada drag.
 */
export const DeskCell = memo(DeskCellInner);
