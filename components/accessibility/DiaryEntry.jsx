"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ScrollText, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createLog } from "@/lib/actions/log-actions";

/**
 * Formulário de nova entrada no Diário de Bordo
 *
 * @param {Object} props
 * @param {string} props.studentId
 * @param {function} [props.onSave]
 */
export function DiaryEntry({ studentId, onSave }) {
  const [category, setCategory] = useState("COMPORTAMENTO");
  const [visibility, setVisibility] = useState("PRIVATE");
  const [description, setDescription] = useState("");
  const [logDate, setLogDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { value: "COMPORTAMENTO", label: "Comportamento" },
    { value: "CRISE", label: "Crise / Meltdown" },
    { value: "PROGRESSO", label: "Progresso" },
    { value: "COMUNICACAO_FAMILIA", label: "Comunicação com Família" },
    { value: "AVALIACAO", label: "Avaliação" },
    { value: "OUTRO", label: "Outro" },
  ];

  const visibilities = [
    { value: "PRIVATE", label: "🔒 Privado (só eu)" },
    { value: "SCHOOL", label: "🏫 Escola (coordenação)" },
    { value: "FAMILY", label: "👨‍👩‍👧 Família" },
  ];

  /**
   * @param {React.FormEvent} e
   */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (description.trim().length < 10) {
      setError("A descrição deve ter pelo menos 10 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // TODO: obter teacherId do contexto
      const result = await createLog(
        {
          studentId,
          category,
          description: description.trim(),
          visibility,
          logDate: new Date(logDate),
        },
        "temp-teacher-id"
      );

      if (result.error) {
        setError(result.error);
        return;
      }

      setDescription("");
      onSave?.(result.data);
    } catch (err) {
      console.error("[DiaryEntry] Error:", err);
      setError("Erro ao registrar entrada.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-1.5">
          <ScrollText className="w-4 h-4" />
          Nova Entrada
        </CardTitle>
        <CardDescription>
          Registre um acontecimento no Diário de Bordo do aluno
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logDate">Data</Label>
              <input
                type="date"
                id="logDate"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Banner de urgência para CRISE */}
              {category === "CRISE" && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700 font-medium">
                    Registro de crise. Após salvar, consulte o Protocolo de Crise no Guia de Manejo do aluno.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o comportamento ou acontecimento observado..."
              rows={3}
              className={cn(
                "resize-none",
                category === "CRISE" && "border-red-400 focus-visible:ring-red-500"
              )}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/5000 caracteres (mínimo 10)
            </p>
          </div>

          {/* Visibilidade */}
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibilidade</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {visibilities.map((vis) => (
                  <SelectItem key={vis.value} value={vis.value}>
                    {vis.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Aviso para visibilidade Família */}
          {visibility === "FAMILY" && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Registros com visibilidade &quot;Família&quot; poderão ser compartilhados
                com os responsáveis legais do aluno.
              </p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="sm"
            disabled={loading || description.trim().length < 10}
            className="bg-mapi-primary hover:bg-mapi-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <ScrollText className="w-4 h-4 mr-1.5" />
                Registrar Entrada
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
