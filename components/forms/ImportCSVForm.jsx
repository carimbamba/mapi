"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ClipboardPaste,
} from "lucide-react";
import { cn } from "@/lib/utils";

const csvTemplate = `nome;necessidades;diagnostico;obs
João Silva;sim;TEA;Laudo de 2024 - precisa de rotina visual
Maria Santos;não;;
Pedro Oliveira;sim;TDAH;Assento próximo ao professor
Ana Costa;sim;DISLEXIA;Tempo extra para leitura
Carlos Souza;não;;`;

/**
 * Formulário de importação CSV em 3 passos:
 * 1. Upload/cola dados
 * 2. Preview dos dados parseados
 * 3. Confirmação com relatório
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onOpenChange
 * @param {string} props.classId
 * @param {function} props.onImport
 */
export function ImportCSVForm({ open, onOpenChange, classId, onImport }) {
  const [step, setStep] = useState(1);
  const [rawData, setRawData] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Parse simples de CSV
   */
  function parseCSV(content) {
    const lines = content
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      return { rows: [], errors: ["Arquivo vazio."] };
    }

    const separator = lines[0].includes(";")
      ? ";"
      : lines[0].includes("\t")
        ? "\t"
        : ",";

    const headerFields = lines[0].split(separator).map((h) => h.trim().toLowerCase());
    const hasHeader = headerFields.some(
      (h) => h === "nome" || h === "name" || h === "aluno"
    );

    const colNome = Math.max(
      0,
      headerFields.findIndex((h) => h === "nome" || h === "name" || h === "aluno")
    );
    const colNec = Math.max(
      0,
      headerFields.findIndex((h) => h.includes("necess") || h.includes("need"))
    );
    const colDiag = Math.max(
      0,
      headerFields.findIndex(
        (h) => h.includes("diagn") || h.includes("diag") || h.includes("cond")
      )
    );
    const colObs = Math.max(
      0,
      headerFields.findIndex(
        (h) => h.includes("obs") || h.includes("nota") || h.includes("coment")
      )
    );

    /** @type {{nome: string, necessidades: boolean, diagnostico: string|null, obs: string|null}[]} */
    const rows = [];
    /** @type {string[]} */
    const errors = [];

    const startIdx = hasHeader ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(separator).map((p) => p.trim());
      const nome = parts[colNome];

      if (!nome || nome.length < 2) {
        errors.push(`Linha ${i + 1}: Nome inválido ou vazio.`);
        continue;
      }

      const necRaw = (parts[colNec] || "").toLowerCase();
      const necessidades =
        necRaw === "sim" || necRaw === "s" || necRaw === "1" || necRaw === "true";

      let diagnostico = parts[colDiag]?.toUpperCase().trim() || null;
      if (diagnostico) {
        const validTypes = [
          "TEA", "TDAH", "TOD", "DISLEXIA", "DISCALCULIA",
          "ALTAS_HABILIDADES", "OUTRO", "NAO_INFORMADO",
        ];
        const found = validTypes.find((t) => diagnostico.includes(t.replace("_", " ")));
        diagnostico = found || null;
      }

      const obs = parts[colObs] || null;

      rows.push({ nome, necessidades, diagnostico, obs, _line: i + 1 });
    }

    return { rows, errors };
  }

  /**
   * Passo 1 → 2: Parse e preview
   */
  function handleNextToPreview() {
    if (!rawData.trim()) return;
    const { rows, errors } = parseCSV(rawData);
    setParsedRows(rows);
    setParseErrors(errors);
    setStep(2);
  }

  /**
   * Passo 2 → 3: Import
   */
  async function handleImport() {
    setLoading(true);
    try {
      const validRows = parsedRows.map((r) => ({
        name: r.nome,
        hasAccessibilityNeeds: r.necessidades,
        diagnosisType: r.diagnostico,
        diagnosisNotes: r.obs,
        prioritySeating: r.necessidades,
        parentConsent: false,
      }));

      await onImport(validRows);

      setImportResult({
        created: validRows.length,
        errors: parseErrors,
      });
      setStep(3);
    } catch (err) {
      console.error("Erro na importação:", err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Reset ao fechar
   */
  function handleOpenChange(open) {
    if (!open) {
      setStep(1);
      setRawData("");
      setParsedRows([]);
      setParseErrors([]);
      setImportResult(null);
    }
    onOpenChange(open);
  }

  /**
   * Download do template CSV
   */
  function downloadTemplate() {
    const blob = new Blob([csvTemplate], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mapi_template_alunos.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Drag & Drop handlers
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
      const reader = new FileReader();
      reader.onload = (ev) => setRawData(ev.target.result);
      reader.readAsText(file);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-mapi-primary" />
            Importar Alunos via CSV
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Cole os dados ou arraste um arquivo CSV."}
            {step === 2 && "Confirme os dados antes de importar."}
            {step === 3 && "Importação concluída."}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  s < step
                    ? "bg-mapi-success text-white"
                    : s === step
                      ? "bg-mapi-primary text-white"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {s < step ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  s
                )}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 rounded",
                    s < step ? "bg-mapi-success" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center -mt-2 mb-4">
          {step === 1
            ? "Dados"
            : step === 2
              ? "Confirmação"
              : "Resultado"}
        </div>

        {/* ── Passo 1: Upload ──────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4">
            {/* Drag & drop area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                isDragging
                  ? "border-mapi-primary bg-mapi-primary/5"
                  : "border-gray-300 hover:border-gray-400"
              )}
            >
              <Upload
                className={cn(
                  "w-10 h-10 mx-auto mb-3 transition-colors",
                  isDragging ? "text-mapi-primary" : "text-muted-foreground"
                )}
              />
              <p className="text-sm font-medium text-foreground">
                {isDragging
                  ? "Solte o arquivo aqui"
                  : "Arraste um arquivo CSV aqui"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ou cole os dados abaixo
              </p>
            </div>

            {/* Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <ClipboardPaste className="w-4 h-4" />
                Ou cole os dados CSV
              </label>
              <textarea
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                placeholder={`nome;necessidades;diagnostico;obs\nJoão Silva;sim;TEA;Laudo de 2024\nMaria Santos;no;;`}
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            {/* Template download */}
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadTemplate}
              className="text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              Baixar template CSV
            </Button>
          </div>
        )}

        {/* ── Passo 2: Preview ─────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Erros de parse */}
            {parseErrors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">
                    {parseErrors.length} erro{parseErrors.length > 1 ? "s" : ""}{" "}
                    encontrado{parseErrors.length > 1 ? "s" : ""}
                  </span>
                </div>
                <ul className="text-xs text-red-600 space-y-0.5 max-h-24 overflow-y-auto">
                  {parseErrors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {parseErrors.length > 5 && (
                    <li className="text-muted-foreground">
                      ...e mais {parseErrors.length - 5}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Preview table */}
            {parsedRows.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">
                  {parsedRows.length} aluno{parsedRows.length > 1 ? "s" : ""}{" "}
                  pronto{parsedRows.length > 1 ? "s" : ""} para importação
                  {parsedRows.length <= 5
                    ? " (mostrando todos)"
                    : " (mostrando primeiros 5)"}
                </p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                          Nome
                        </th>
                        <th className="text-center px-3 py-2 font-medium text-muted-foreground">
                          Necess.
                        </th>
                        <th className="text-center px-3 py-2 font-medium text-muted-foreground">
                          Diag.
                        </th>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                          Obs
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {parsedRows.slice(0, 5).map((row, i) => (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="px-3 py-2 font-medium">{row.nome}</td>
                          <td className="px-3 py-2 text-center">
                            {row.necessidades ? (
                              <Badge
                                variant="secondary"
                                className="text-[10px] bg-amber-50 text-amber-700"
                              >
                                Sim
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {row.diagnostico ? (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {row.diagnostico}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground truncate max-w-[120px]">
                            {row.obs || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Passo 3: Resultado ───────────────────────────────────── */}
        {step === 3 && importResult && (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-mapi-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7 text-mapi-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Importação Concluída!
              </h3>
              <p className="text-muted-foreground mt-1">
                {importResult.created} aluno{importResult.created > 1 ? "s" : ""}{" "}
                importado{importResult.created > 1 ? "s" : ""} com sucesso.
              </p>
            </div>

            {importResult.errors.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-amber-700">
                    {importResult.errors.length} aviso{importResult.errors.length > 1 ? "s" : ""}
                  </span>
                </div>
                <ul className="text-xs text-amber-600 space-y-0.5 max-h-20 overflow-y-auto">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Footer / Navigation */}
        <DialogFooter className="flex gap-2">
          {step > 1 && step < 3 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
          )}

          <div className="flex-1" />

          {step === 1 && (
            <Button
              onClick={handleNextToPreview}
              disabled={!rawData.trim()}
              className="bg-mapi-primary hover:bg-mapi-primary/90"
            >
              Revisar Dados
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}

          {step === 2 && (
            <Button
              onClick={handleImport}
              disabled={loading || parsedRows.length === 0}
              className="bg-mapi-primary hover:bg-mapi-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  Importar {parsedRows.length} Aluno{parsedRows.length > 1 ? "s" : ""}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          )}

          {step === 3 && (
            <Button
              onClick={() => handleOpenChange(false)}
              className="bg-mapi-primary hover:bg-mapi-primary/90"
            >
              Concluído
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
