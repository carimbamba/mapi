"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { SeatingCanvas } from "@/components/seating/SeatingCanvas";
import { LayoutSelector } from "@/components/seating/LayoutSelector";
import { generateSeatingMap } from "@/lib/algorithms/seating-generator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Map, ArrowRight, CheckCircle2 } from "lucide-react";

/**
 * Página do Mapa Interativo de Sala de Aula
 *
 * - Se não há mapa: wizard de 2 passos (escolher layout → confirmar)
 * - Canvas 70% + sidebar 30% com alunos não posicionados
 * - Mobile: canvas fullscreen + lista em bottom sheet
 */
export default function MapPage({ params }) {
  const classId = params.classId;

  // Data
  const [students, setStudents] = useState([]);
  const [positions, setPositions] = useState([]);
  const [classData, setClassData] = useState(null);

  // Layout
  const [layoutType, setLayoutType] = useState("rows");
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Load data
  useEffect(() => {
    loadData();
  }, [classId]);

  async function loadData() {
    setLoading(true);
    try {
      // TODO: substituir por chamadas reais às API/Server Actions
      // Simulação para MVP
      const mockStudents = Array.from({ length: 20 }, (_, i) => ({
        id: `s${i + 1}`,
        name: `Aluno ${i + 1}`,
        classId,
        hasAccessibilityNeeds: i % 5 === 0,
        diagnosisType: i % 5 === 0 ? (i % 10 === 0 ? "TEA" : "TDAH") : null,
        prioritySeating: i % 5 === 0,
        createdAt: new Date().toISOString(),
      }));

      setStudents(mockStudents);
      setClassData({ id: classId, name: `Turma ${classId.slice(0, 8)}` });
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }

    // Check if there's an existing map
    try {
      // TODO: chamar API para buscar mapa existente
      // Por enquanto, mostra wizard se não há posições
      setShowWizard(positions.length === 0 && students.length > 0);
    } catch (err) {
      console.error("Erro ao verificar mapa existente:", err);
    }
  }

  /**
   * Gerar mapa automaticamente via algoritmo
   */
  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = generateSeatingMap(
        students,
        { type: layoutType, rows, cols, desks: [] },
        [],
        { prioritizeAccessibility: true }
      );

      setPositions(result.placements);

      if (result.warnings.length > 0) {
        console.warn("Warnings do algoritmo:", result.warnings);
      }
    } catch (err) {
      console.error("Erro ao gerar mapa:", err);
    } finally {
      setGenerating(false);
    }
  }

  /**
   * Salvar posições
   */
  async function handleSave(newPositions) {
    setSaving(true);
    try {
      // TODO: chamar API/Server Action para salvar
      // Log em desenvolvimento apenas
      if (process.env.NODE_ENV === "development") {
        console.log("Salvando posições:", newPositions.length, "alunos");
      }
      setPositions(newPositions);
    } catch (err) {
      console.error("Erro ao salvar mapa:", err);
    } finally {
      setSaving(false);
    }
  }

  /**
   * Wizard: confirmar layout
   */
  function handleWizardConfirm() {
    setShowWizard(false);
    handleGenerate();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mapi-background">
        <TopBar />
        <main className="p-6 ml-0 lg:ml-64">
          <div className="text-center py-20 text-muted-foreground">
            Carregando mapa da sala...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mapi-background">
      <TopBar
        action={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">
              {classData?.name || "Turma"}
            </span>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 ml-0 lg:ml-64">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Mapa da Sala
          </h1>
          <p className="text-muted-foreground mt-1">
            Arraste alunos entre as mesas ou gere o mapa automaticamente
          </p>
        </div>

        {/* ── Wizard (se não há mapa) ──────────────────────────────── */}
        <Dialog open={showWizard} onOpenChange={setShowWizard}>
          <DialogContent className="sm:max-w-lg">
            {wizardStep === 1 && (
              <>
                <DialogHeader>
                  <DialogTitle>Configure o Layout da Sala</DialogTitle>
                  <DialogDescription>
                    Escolha o formato que melhor se adapta à sua turma. Você
                    poderá ajustar depois.
                  </DialogDescription>
                </DialogHeader>

                <LayoutSelector
                  value={layoutType}
                  onChange={setLayoutType}
                  rows={rows}
                  onRowsChange={setRows}
                  cols={cols}
                  onColsChange={setCols}
                />

                <DialogFooter>
                  <Button
                    onClick={() => setWizardStep(2)}
                    className="bg-mapi-primary hover:bg-mapi-primary/90"
                  >
                    Próximo
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </DialogFooter>
              </>
            )}

            {wizardStep === 2 && (
              <>
                <DialogHeader>
                  <DialogTitle>Confirmar Geração</DialogTitle>
                  <DialogDescription>
                    O algoritmo vai posicionar automaticamente os{" "}
                    {students.length} alunos, priorizando alunos com
                    necessidades especiais.
                  </DialogDescription>
                </DialogHeader>

                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Layout</span>
                    <span className="font-medium">
                      {layoutType === "rows"
                        ? "Fileiras"
                        : layoutType === "groups"
                          ? "Grupos"
                          : "Formato U"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Grade</span>
                    <span className="font-medium">
                      {rows} fileiras × {cols} colunas
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Alunos</span>
                    <span className="font-medium">{students.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Alunos com necessidades
                    </span>
                    <span className="font-medium text-mapi-warning">
                      {students.filter((s) => s.hasAccessibilityNeeds).length}
                    </span>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setWizardStep(1)}
                  >
                    Voltar
                  </Button>
                  <Button
                    onClick={handleWizardConfirm}
                    className="bg-mapi-primary hover:bg-mapi-primary/90"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Gerar Mapa
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Main Content ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Canvas — 3/4 */}
          <div className="xl:col-span-3">
            <SeatingCanvas
              students={students}
              positions={positions}
              layoutType={layoutType}
              rows={rows}
              cols={cols}
              onPositionsChange={setPositions}
              onSave={handleSave}
              onGenerate={handleGenerate}
              saving={saving}
              classId={classId}
            />
          </div>

          {/* Sidebar — 1/4 (alunos não posicionados + configurações) */}
          <div className="xl:col-span-1 space-y-4">
            {/* Layout config */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Layout</CardTitle>
                <CardDescription className="text-xs">
                  Altere o formato da sala
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LayoutSelector
                  value={layoutType}
                  onChange={setLayoutType}
                  rows={rows}
                  onRowsChange={setRows}
                  cols={cols}
                  onColsChange={setCols}
                />
                <Button
                  size="sm"
                  className="w-full mt-3 bg-mapi-primary hover:bg-mapi-primary/90"
                  onClick={handleGenerate}
                  disabled={generating || students.length === 0}
                >
                  {generating ? (
                    <>
                      <span className="animate-spin mr-1">⏳</span>
                      Gerando...
                    </>
                  ) : (
                    "Regenerar Mapa"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total alunos</span>
                  <span className="font-medium">{students.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posicionados</span>
                  <span className="font-medium text-mapi-success">
                    {positions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sem posição</span>
                  <span className="font-medium text-mapi-warning">
                    {students.length - positions.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Com necessidades
                  </span>
                  <span className="font-medium text-mapi-warning">
                    {students.filter((s) => s.hasAccessibilityNeeds).length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
