"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStudentSchema } from "@/lib/validation/schemas";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Save,
  X,
  Shield,
  Armchair,
  FileText,
  Users,
} from "lucide-react";

const diagnosisOptions = [
  { value: "TEA", label: "TEA — Transtorno do Espectro Autista" },
  { value: "TDAH", label: "TDAH — Déficit de Atenção com Hiperatividade" },
  { value: "TOD", label: "TOD — Transtorno Opositivo Desafiador" },
  { value: "DISLEXIA", label: "Dislexia" },
  { value: "DISCALCULIA", label: "Discalculia" },
  {
    value: "ALTAS_HABILIDADES",
    label: "Altas Habilidades / Superdotação",
  },
  { value: "OUTRO", label: "Outro" },
  { value: "NAO_INFORMADO", label: "Prefiro não informar" },
];

/**
 * Formulário de aluno com 3 seções:
 * 1. Dados básicos
 * 2. Necessidades de Acessibilidade + LGPD
 * 3. Regras de posicionamento
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onOpenChange
 * @param {import('@/types').Student | null} [props.initialData]
 * @param {string} props.classId
 * @param {import('@/types').Student[]} [props.allStudents]
 * @param {function} props.onSubmit
 */
export function StudentForm({
  open,
  onOpenChange,
  initialData,
  classId,
  allStudents = [],
  onSubmit,
}) {
  const [loading, setLoading] = useState(false);
  const [keepTogether, setKeepTogether] = useState([]);
  const [keepApart, setKeepApart] = useState([]);

  const isEdit = !!initialData;

  const form = useForm({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      name: initialData?.name || "",
      hasAccessibilityNeeds: initialData?.hasAccessibilityNeeds || false,
      diagnosisType: initialData?.diagnosisType || null,
      diagnosisNotes: initialData?.diagnosisNotes || "",
      prioritySeating: initialData?.prioritySeating || false,
      parentConsent: initialData?.parentConsent || false,
    },
  });

  const hasNeeds = form.watch("hasAccessibilityNeeds");

  /**
   * @param {Object} data
   */
  async function handleSubmit(data) {
    setLoading(true);
    try {
      await onSubmit({
        ...data,
        diagnosisNotes: data.diagnosisNotes || null,
        classId,
        rules: { keepTogether, keepApart },
      });
      form.reset();
      setKeepTogether([]);
      setKeepApart([]);
    } catch (err) {
      console.error("[StudentForm] Submit error:", err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Toggle aluno nas regras
   * @param {string} studentId
   * @param {'together'|'apart'} type
   */
  function toggleStudentRule(studentId, type) {
    if (type === "together") {
      setKeepTogether((prev) =>
        prev.includes(studentId)
          ? prev.filter((id) => id !== studentId)
          : [...prev, studentId]
      );
      // Remove de keepApart se estiver lá
      if (keepApart.includes(studentId)) {
        setKeepApart((prev) => prev.filter((id) => id !== studentId));
      }
    } else {
      setKeepApart((prev) =>
        prev.includes(studentId)
          ? prev.filter((id) => id !== studentId)
          : [...prev, studentId]
      );
      // Remove de keepTogether se estiver lá
      if (keepTogether.includes(studentId)) {
        setKeepTogether((prev) => prev.filter((id) => id !== studentId));
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>
            {isEdit ? "Editar Aluno" : "Novo Aluno"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Atualize os dados do aluno"
              : "Adicione um aluno a esta turma. Dados de diagnóstico são opcionais e protegidos por LGPD."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6 mt-4"
        >
          {/* ── Seção 1: Dados Básicos ──────────────────────────────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-mapi-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Dados Básicos
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Nome completo do aluno"
                {...form.register("name")}
                className={form.formState.errors.name ? "border-red-500" : ""}
              />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* ── Seção 2: Necessidades de Acessibilidade ─────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-mapi-warning" />
              <h3 className="text-sm font-semibold text-foreground">
                Necessidades de Acessibilidade
              </h3>
            </div>

            {/* Toggle principal */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">
                  Tem necessidades específicas?
                </Label>
                <p className="text-xs text-muted-foreground">
                  Ative para registrar diagnóstico e observações
                </p>
              </div>
              <Switch
                checked={hasNeeds}
                onCheckedChange={(val) => {
                  form.setValue("hasAccessibilityNeeds", val);
                  if (!val) {
                    form.setValue("diagnosisType", null);
                    form.setValue("diagnosisNotes", "");
                    form.setValue("prioritySeating", false);
                  }
                }}
              />
            </div>

            {/* Campos condicionais */}
            {hasNeeds && (
              <div className="space-y-4 p-4 bg-mapi-primary/5 rounded-lg border border-mapi-primary/20">
                {/* Tipo de diagnóstico */}
                <div className="space-y-2">
                  <Label htmlFor="diagnosisType">Tipo de diagnóstico</Label>
                  <select
                    id="diagnosisType"
                    value={form.watch("diagnosisType") || ""}
                    onChange={(e) =>
                      form.setValue("diagnosisType", e.target.value || null)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Selecione...</option>
                    {diagnosisOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="diagnosisNotes" className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Observações
                  </Label>
                  <Textarea
                    id="diagnosisNotes"
                    value={form.watch("diagnosisNotes") || ""}
                    onChange={(e) =>
                      form.setValue("diagnosisNotes", e.target.value)
                    }
                    placeholder="Informações do laudo, características específicas, estratégias que funcionam..."
                    rows={3}
                    className="text-sm resize-none"
                  />
                </div>

                {/* Assento prioritário */}
                <div className="flex items-center justify-between p-2 bg-white rounded">
                  <div className="flex items-center gap-2">
                    <Armchair className="w-4 h-4 text-mapi-primary" />
                    <div>
                      <Label className="text-sm font-medium">
                        Assento prioritário
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Próximo ao professor ou quadro
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={form.watch("prioritySeating")}
                    onCheckedChange={(val) =>
                      form.setValue("prioritySeating", val)
                    }
                  />
                </div>

                {/* Consentimento LGPD */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <Label className="text-sm font-medium text-amber-900">
                        Consentimento LGPD
                      </Label>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Dados de diagnóstico são informações sensíveis sob a Lei
                        Geral de Proteção de Dados (Lei 13.709/2018).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Switch
                      checked={form.watch("parentConsent")}
                      onCheckedChange={(val) =>
                        form.setValue("parentConsent", val)
                      }
                      id="parentConsent"
                    />
                    <Label
                      htmlFor="parentConsent"
                      className="text-xs text-amber-800 cursor-pointer"
                    >
                      Confirmo que tenho autorização do responsável legal para
                      registrar estas informações sensíveis.
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* ── Seção 3: Regras de Posicionamento ───────────────────── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Armchair className="w-4 h-4 text-mapi-success" />
              <h3 className="text-sm font-semibold text-foreground">
                Regras de Posicionamento
              </h3>
            </div>

            {allStudents.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Adicione outros alunos à turma para configurar regras de
                posicionamento.
              </p>
            ) : (
              <div className="space-y-3">
                {/* Manter junto */}
                <div>
                  <Label className="text-sm text-mapi-success flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-mapi-success rounded-full" />
                    Manter junto com
                  </Label>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {allStudents.map((s) => {
                      const selected = keepTogether.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleStudentRule(s.id, "together")}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${selected
                              ? "bg-mapi-success/10 text-mapi-success border-mapi-success/30"
                              : "bg-white text-muted-foreground border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          {s.name.split(" ")[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Manter separado */}
                <div>
                  <Label className="text-sm text-red-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-red-400 rounded-full" />
                    Manter separado de
                  </Label>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {allStudents.map((s) => {
                      const selected = keepApart.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => toggleStudentRule(s.id, "apart")}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${selected
                              ? "bg-red-50 text-red-600 border-red-200"
                              : "bg-white text-muted-foreground border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          {s.name.split(" ")[0]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <SheetFooter className="pt-4 gap-2 flex-row">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-mapi-primary hover:bg-mapi-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  {isEdit ? "Atualizar" : "Adicionar Aluno"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setKeepTogether([]);
                setKeepApart([]);
                onOpenChange(false);
              }}
            >
              <X className="w-4 h-4 mr-1.5" />
              Cancelar
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
