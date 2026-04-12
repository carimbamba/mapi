"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLogs, deleteLog } from "@/lib/actions/log-actions";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Users,
  Pencil,
  Trash2,
  Download,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryConfig = {
  COMPORTAMENTO: { label: "Comportamento", color: "bg-blue-100 text-blue-800 border-blue-200" },
  CRISE: { label: "Crise", color: "bg-red-100 text-red-800 border-red-200", urgent: true },
  PROGRESSO: { label: "Progresso", color: "bg-green-100 text-green-800 border-green-200" },
  COMUNICACAO_FAMILIA: { label: "Comunicação", color: "bg-purple-100 text-purple-800 border-purple-200" },
  AVALIACAO: { label: "Avaliação", color: "bg-amber-100 text-amber-800 border-amber-200" },
  OUTRO: { label: "Outro", color: "bg-gray-100 text-gray-800 border-gray-200" },
};

const visibilityConfig = {
  PRIVATE: { label: "Privado", icon: EyeOff },
  SCHOOL: { label: "Escola", icon: Users },
  FAMILY: { label: "Família", icon: Eye },
};

/**
 * Timeline cronológica de entradas do Diário de Bordo
 *
 * @param {Object} props
 * @param {string} props.studentId
 */
export function DiaryList({ studentId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const [filterPeriod, setFilterPeriod] = useState("all"); // all, 7d, 30d, 90d

  useEffect(() => {
    loadEntries();
  }, [studentId]);

  async function loadEntries() {
    setLoading(true);
    try {
      // TODO: obter teacherId do contexto
      const result = await getLogs(studentId, "temp-teacher-id");
      if (result.data) {
        setEntries(result.data);
      }
    } catch (err) {
      console.error("[DiaryList] Error:", err);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Filtra entradas
   */
  const filteredEntries = entries.filter((entry) => {
    // Categoria
    if (filterCategory !== "all" && entry.category !== filterCategory) return false;

    // Visibilidade
    if (filterVisibility !== "all" && entry.visibility !== filterVisibility) return false;

    // Período
    if (filterPeriod !== "all") {
      const entryDate = new Date(entry.logDate);
      const now = new Date();
      const days = filterPeriod === "7d" ? 7 : filterPeriod === "30d" ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      if (entryDate < cutoff) return false;
    }

    return true;
  });

  /**
   * Deleta entrada
   */
  async function handleDelete(logId) {
    if (!confirm("Tem certeza que deseja excluir esta entrada?")) return;

    try {
      await deleteLog(logId, "temp-teacher-id");
      setEntries((prev) => prev.filter((e) => e.id !== logId));
    } catch (err) {
      console.error("[DiaryList] Delete error:", err);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Carregando diário...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com filtros */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <ScrollText className="w-4 h-4" />
          Diário de Bordo
          <Badge variant="secondary" className="text-xs ml-1">
            {filteredEntries.length}
          </Badge>
        </h3>

        {/* Export (feature premium) */}
        <Button size="sm" variant="ghost" className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1" />
          Exportar PDF
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <Select value={filterPeriod} onValueChange={setFilterPeriod}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todo período</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {Object.entries(categoryConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterVisibility} onValueChange={setFilterVisibility}>
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue placeholder="Visibilidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(visibilityConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Timeline */}
      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {entries.length === 0
                ? "Nenhuma entrada registrada ainda."
                : "Nenhuma entrada corresponde aos filtros."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry, index) => {
            const catConfig = categoryConfig[entry.category] || categoryConfig.OUTRO;
            const visConfig = visibilityConfig[entry.visibility] || visibilityConfig.PRIVATE;
            const VisIcon = visConfig.icon;

            return (
              <div key={entry.id} className="relative">
                {/* Urgency indicator for CRISE */}
                {catConfig.urgent && (
                  <div className="absolute -left-2 top-0 bottom-0 w-1 bg-red-500 rounded-full" />
                )}

                {/* Timeline line */}
                {index < filteredEntries.length - 1 && (
                  <div className="absolute left-3 top-10 bottom-0 w-px bg-border" />
                )}

                <Card className={cn(
                  "hover:shadow-sm transition-shadow",
                  catConfig.urgent && "border-red-200"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-xs ${catConfig.color}`}
                        >
                          {catConfig.label}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(entry.logDate), {
                            locale: ptBR,
                            addSuffix: true,
                          })}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <VisIcon className="w-3 h-3" />
                          {visConfig.label}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          aria-label="Editar entrada"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500"
                          onClick={() => handleDelete(entry.id)}
                          aria-label="Excluir entrada"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {entry.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(entry.logDate), "dd 'de' MMMM 'de' yyyy, HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
