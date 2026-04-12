"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ConditionBadge } from "./ConditionBadge";
import { DiaryEntry } from "./DiaryEntry";
import { DiaryList } from "./DiaryList";
import { ManagementGuide } from "./ManagementGuide";
import { getGuide } from "@/lib/accessibility/condition-guides";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Pencil,
  BookOpen,
  ScrollText,
  Users,
} from "lucide-react";

/**
 * Perfil lateral do aluno — Sheet (não modal)
 *
 * Tabs: Perfil, Diário de Bordo, Guia de Manejo
 * Proteção LGPD: diagnóstico só visível com consentimento.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onOpenChange
 * @param {import('@/types').Student} [props.student]
 * @param {string} [props.className]
 */
export function StudentProfile({ open, onOpenChange, student, className }) {
  const [activeTab, setActiveTab] = useState("perfil");
  const [editingConsent, setEditingConsent] = useState(false);
  const [localConsent, setLocalConsent] = useState(false);

  // Sincroniza localConsent quando o aluno muda
  useEffect(() => {
    setLocalConsent(student?.parentConsent || false);
    setEditingConsent(false);
    setActiveTab("perfil");
  }, [student?.id, student?.parentConsent]);

  if (!student) {
    return null;
  }

  const guide = student.diagnosisType ? getGuide(student.diagnosisType) : null;

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const categoryLabels = {
    COMPORTAMENTO: "Comportamento",
    CRISE: "Crise",
    PROGRESSO: "Progresso",
    COMUNICACAO_FAMILIA: "Comunicação com Família",
    AVALIACAO: "Avaliação",
    OUTRO: "Outro",
  };

  /**
   * Salva consentimento
   */
  async function handleSaveConsent() {
    // TODO: chamar Server Action para atualizar student.parentConsent
    setEditingConsent(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        {/* ── Header ──────────────────────────────────────────────── */}
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14">
              <AvatarFallback className="bg-mapi-primary text-white text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-lg truncate">
                {student.name}
              </SheetTitle>
              <SheetDescription>
                {student.classId ? "Turma ativa" : "Sem turma"}
              </SheetDescription>
            </div>
          </div>

          {/* Badges de condições */}
          {student.hasAccessibilityNeeds && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <ConditionBadge
                condition={student.diagnosisType}
                showLabel
                size="md"
              />
              {student.prioritySeating && (
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs"
                >
                  Assento prioritário
                </Badge>
              )}
            </div>
          )}
        </SheetHeader>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="perfil" className="flex items-center gap-1 text-xs">
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="diario" className="flex items-center gap-1 text-xs">
              <ScrollText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Diário</span>
            </TabsTrigger>
            <TabsTrigger value="guia" className="flex items-center gap-1 text-xs">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guia</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Aba Perfil ──────────────────────────────────────────── */}
          <TabsContent value="perfil" className="space-y-4 mt-4">
            {/* Seção de diagnóstico — protegida por consentimento */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    {localConsent ? (
                      <ShieldCheck className="w-4 h-4 text-mapi-success" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-mapi-warning" />
                    )}
                    Informações Clínicas
                  </h3>
                  {!editingConsent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingConsent(true)}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      {localConsent ? "Gerenciar" : "Registrar"}
                    </Button>
                  )}
                </div>

                {localConsent ? (
                  <div className="space-y-3">
                    {student.diagnosisType && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Diagnóstico
                        </p>
                        <p className="text-sm font-medium">
                          {guide?.name || student.diagnosisType}
                        </p>
                      </div>
                    )}
                    {student.diagnosisNotes && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Observações
                        </p>
                        <p className="text-sm text-foreground bg-muted rounded-lg p-3">
                          {student.diagnosisNotes}
                        </p>
                      </div>
                    )}
                    {!student.diagnosisType && !student.diagnosisNotes && (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma informação clínica registrada.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!editingConsent ? (
                      <>
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-amber-900">
                              Consentimento necessário
                            </p>
                            <p className="text-xs text-amber-700 mt-0.5">
                              Registre o consentimento do responsável legal para
                              ver informações clínicas do aluno, conforme a LGPD
                              (Lei 13.709/2018).
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingConsent(true)}
                          className="w-full"
                        >
                          <Shield className="w-4 h-4 mr-1.5" />
                          Registrar Consentimento
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-900">
                          Confirmo que tenho autorização do responsável legal
                          para acessar estas informações sensíveis.
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveConsent}
                            className="bg-mapi-success hover:bg-mapi-success/90"
                          >
                            <ShieldCheck className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingConsent(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Regras de posicionamento ativas */}
            <Card>
              <CardContent className="pt-4">
                <h3 className="text-sm font-semibold mb-3">
                  Regras de Posicionamento
                </h3>
                {student.prioritySeating ? (
                  <div className="flex items-center gap-2 text-sm text-mapi-primary">
                    <Shield className="w-4 h-4" />
                    Assento prioritário habilitado
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma regra específica registrada.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Botão Editar */}
            <SheetFooter>
              <Button variant="outline" className="w-full">
                <Pencil className="w-4 h-4 mr-1.5" />
                Editar Perfil Completo
              </Button>
            </SheetFooter>
          </TabsContent>

          {/* ── Aba Diário de Bordo ─────────────────────────────────── */}
          <TabsContent value="diario" className="space-y-4 mt-4">
            <DiaryEntry studentId={student.id} />
            <Separator />
            <DiaryList studentId={student.id} />
          </TabsContent>

          {/* ── Aba Guia de Manejo ──────────────────────────────────── */}
          <TabsContent value="guia" className="mt-4">
            {student.diagnosisType ? (
              <ManagementGuide conditionType={student.diagnosisType} />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum guia disponível — registre um diagnóstico para ver
                    orientações de manejo.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
