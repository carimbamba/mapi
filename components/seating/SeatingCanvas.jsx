"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { createLayoutConfig } from "@/lib/algorithms/seating-generator";
import { DeskCell } from "./DeskCell";
import { StudentCard } from "./StudentCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  WandSparkles,
  Save,
  Eraser,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { toPng } from "html-to-image";

/**
 * Mapa de Sala Interativo — componente principal
 *
 * Features:
 * - Drag & drop com dnd-kit (mouse + teclado)
 * - Zoom 75%-150%
 * - Toolbar: Gerar, Limpar, Salvar, Exportar PNG
 * - Optimistic updates
 * - React.memo + useMemo para evitar re-renders desnecessários
 *
 * @param {Object} props
 * @param {import('@/types').Student[]} props.students
 * @param {Array} props.positions — {studentId, deskId, positionX, positionY}
 * @param {string} props.layoutType — 'rows'|'groups'|'u_shape'
 * @param {number} [props.rows=5]
 * @param {number} [props.cols=6]
 * @param {function} [props.onPositionsChange]
 * @param {function} [props.onSave]
 * @param {function} [props.onGenerate]
 * @param {boolean} [props.saving]
 * @param {string} [props.classId]
 */
export function SeatingCanvas({
  students,
  positions,
  layoutType,
  rows = 5,
  cols = 6,
  onPositionsChange,
  onSave,
  onGenerate,
  saving = false,
  classId,
}) {
  const canvasRef = useRef(null);

  // Zoom state
  const [zoom, setZoom] = useState(100);
  const [exporting, setExporting] = useState(false);
  const [dragOverDesk, setDragOverDesk] = useState(null);

  // ─── Memos (evita recalcular a cada render) ───────────────────────────

  const studentMap = useMemo(() => {
    const map = new Map();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  const deskStudentMap = useMemo(() => {
    const map = new Map();
    positions.forEach((p) => map.set(p.deskId, p));
    return map;
  }, [positions]);

  const layoutConfig = useMemo(
    () => createLayoutConfig(layoutType, rows, cols),
    [layoutType, rows, cols]
  );

  const placedStudentIds = useMemo(
    () => new Set(positions.map((p) => p.studentId)),
    [positions]
  );

  const unplacedStudents = useMemo(
    () => students.filter((s) => !placedStudentIds.has(s.id)),
    [students, placedStudentIds]
  );

  const accessibilityCount = useMemo(
    () => students.filter((s) => s.hasAccessibilityNeeds).length,
    [students]
  );

  // ─── Sensors (memoizado) ──────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ─── Handlers (useCallback para estabilidade de referência) ───────────

  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || !active) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      // Student → Desk
      if (activeData?.type === "student" && overData?.type === "desk") {
        const studentId = activeData.studentId;
        const targetDeskId = overData.deskId;

        const newPositions = positions
          .filter((p) => p.studentId !== studentId && p.deskId !== targetDeskId);

        const desk = layoutConfig.desks.find((d) => d.id === targetDeskId);
        if (desk) {
          newPositions.push({
            studentId,
            deskId: targetDeskId,
            positionX: desk.x,
            positionY: desk.y,
          });
        }

        onPositionsChange?.(newPositions);
      }

      // Student → Student (swap)
      if (
        activeData?.type === "student" &&
        overData?.type === "student" &&
        activeData.studentId !== overData.studentId
      ) {
        const newPositions = positions.map((p) => {
          if (p.studentId === activeData.studentId) {
            const otherPos = positions.find(
              (pp) => pp.studentId === overData.studentId
            );
            return otherPos
              ? {
                ...p,
                deskId: otherPos.deskId,
                positionX: otherPos.positionX,
                positionY: otherPos.positionY,
              }
              : p;
          }
          if (p.studentId === overData.studentId) {
            const otherPos = positions.find(
              (pp) => pp.studentId === activeData.studentId
            );
            return otherPos
              ? {
                ...p,
                deskId: otherPos.deskId,
                positionX: otherPos.positionX,
                positionY: otherPos.positionY,
              }
              : p;
          }
          return p;
        });

        onPositionsChange?.(newPositions);
      }
    },
    [positions, layoutConfig.desks, onPositionsChange]
  );

  const handleDragOver = useCallback((event) => {
    const overData = event.over?.data.current;
    if (overData?.type === "desk") {
      setDragOverDesk(overData.deskId);
    }
  }, []);

  const handleDragCancel = useCallback(() => {
    setDragOverDesk(null);
  }, []);

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(150, z + 25)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(75, z - 25)), []);
  const handleZoomReset = useCallback(() => setZoom(100), []);

  const handleClear = useCallback(() => {
    if (
      !confirm(
        "Tem certeza que deseja limpar o mapa? Todos os posicionamentos serão perdidos."
      )
    )
      return;
    onPositionsChange?.([]);
  }, [onPositionsChange]);

  const handleExportPNG = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(canvasRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#F8FAFC",
        filter: (node) => !node?.classList?.contains("no-export"),
      });

      const link = document.createElement("a");
      link.download = `mapa-sala-${classId || "turma"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Erro ao exportar PNG:", err);
    } finally {
      setExporting(false);
    }
  }, [classId]);

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 no-export">
        <Button
          size="sm"
          variant="outline"
          onClick={onGenerate}
          disabled={saving || students.length === 0}
        >
          <WandSparkles className="w-4 h-4 mr-1.5" />
          Gerar Automaticamente
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleClear}
          disabled={saving || positions.length === 0}
        >
          <Eraser className="w-4 h-4 mr-1.5" />
          Limpar
        </Button>

        <Button
          size="sm"
          onClick={() => onSave?.(positions)}
          disabled={saving || positions.length === 0}
          className="bg-mapi-primary hover:bg-mapi-primary/90"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              <span aria-live="polite">Salvando...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1.5" />
              Salvar
            </>
          )}
        </Button>

        <div className="flex-1" />

        {/* Zoom */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1" role="toolbar" aria-label="Ferramentas de zoom">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleZoomOut}
            disabled={zoom <= 75}
            aria-label="Diminuir zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs font-mono w-10 text-center" aria-live="polite">
            {zoom}%
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleZoomIn}
            disabled={zoom >= 150}
            aria-label="Aumentar zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleZoomReset}
            aria-label="Resetar zoom para 100%"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Export */}
        <Button
          size="sm"
          variant="ghost"
          onClick={handleExportPNG}
          disabled={exporting || positions.length === 0}
          aria-label="Exportar mapa como PNG"
        >
          <Download className="w-4 h-4 mr-1" />
          PNG
        </Button>

        {/* Stats */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {positions.length}/{students.length} posicionados
          </Badge>
          {accessibilityCount > 0 && (
            <Badge
              variant="secondary"
              className="text-xs bg-amber-50 text-amber-700 border-amber-200"
            >
              {accessibilityCount} NEE
            </Badge>
          )}
        </div>
      </div>

      {/* ── Canvas ───────────────────────────────────────────────── */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragCancel={handleDragCancel}
      >
        <div
          ref={canvasRef}
          className="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto p-6"
          style={{ minHeight: "400px" }}
        >
          <div className="text-center mb-6">
            <div className="inline-block px-6 py-2 bg-mapi-primary/10 rounded-full text-sm font-medium text-mapi-primary">
              ← Área do Professor →
            </div>
          </div>

          <div
            className="inline-block transition-transform duration-200"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}
          >
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${cols}, 80px)` }}
              role="grid"
              aria-label="Mapa de sala de aula"
            >
              {layoutConfig.desks.map((desk) => {
                const pos = deskStudentMap.get(desk.id);
                const student = pos?.studentId
                  ? studentMap.get(pos.studentId)
                  : null;

                return (
                  <DeskCell
                    key={desk.id}
                    deskId={desk.id}
                    x={desk.x}
                    y={desk.y}
                    isBlocked={desk.isBlocked}
                    isAisle={desk.isAisle}
                    isDragOver={dragOverDesk === desk.id && !student}
                  >
                    {student && <StudentCard student={student} compact />}
                  </DeskCell>
                );
              })}
            </div>
          </div>
        </div>
      </DndContext>

      {/* ── Unplaced students ────────────────────────────────────── */}
      {unplacedStudents.length > 0 && (
        <div className="bg-white rounded-xl border p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">
            Alunos não posicionados ({unplacedStudents.length})
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            Arraste os alunos para o mapa acima
          </p>
          <div className="flex flex-wrap gap-2">
            {unplacedStudents.map((student) => (
              <div key={student.id} className="w-36">
                <StudentCard student={student} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Legend ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground no-export">
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-indigo-500" />
          TEA
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          TDAH
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          Dislexia
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          Altas Habilidades
        </span>
        <span className="flex items-center gap-1">
          <div className="w-3 h-1.5 bg-amber-300/50 rounded-full" />
          Corredor
        </span>
      </div>
    </div>
  );
}

/**
 * Keyboard coordinate getter para dnd-kit
 * WCAG 2.1 AA — navegação por teclado
 */
function sortableKeyboardCoordinates(event, context) {
  const { currentCoordinates, keyboardCode } = context;
  if (!currentCoordinates) return currentCoordinates;

  const step = 20;
  const coords = { ...currentCoordinates };

  switch (keyboardCode) {
    case "ArrowUp":
      coords.y -= step;
      break;
    case "ArrowDown":
      coords.y += step;
      break;
    case "ArrowLeft":
      coords.x -= step;
      break;
    case "ArrowRight":
      coords.x += step;
      break;
    default:
      return currentCoordinates; // fallback seguro
  }

  return coords;
}
