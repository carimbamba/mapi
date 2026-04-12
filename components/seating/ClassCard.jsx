"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Users,
  Map,
  MoreVertical,
  Pencil,
  Copy,
  Trash2,
  Eye,
  Accessibility,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Card de turma para listagem no dashboard
 *
 * @param {Object} props
 * @param {import('@/types').ClassWithStudentCount} props.classItem
 * @param {number} [props.needsCount]
 * @param {function} [props.onEdit]
 * @param {function} [props.onDuplicate]
 * @param {function} [props.onDelete]
 */
export function ClassCard({
  classItem,
  needsCount = 0,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const studentCount = classItem._count?.students || 0;

  // Cores por período
  const periodColors = {
    Manhã: "bg-amber-100 text-amber-800 border-amber-200",
    Tarde: "bg-blue-100 text-blue-800 border-blue-200",
    Noite: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Integral: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  const periodColor = periodColors[classItem.period] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <div
      className={cn(
        "group relative bg-white rounded-xl border border-gray-200",
        "shadow-sm hover:shadow-lg hover:border-mapi-primary/40",
        "transition-all duration-200 overflow-hidden"
      )}
    >
      {/* Barra colorida no topo */}
      <div className="h-1.5 bg-gradient-to-r from-mapi-primary to-mapi-primary/70" />

      <div className="p-5">
        {/* Header: nome + menu */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <Link
              href={`/dashboard/classes/${classItem.id}`}
              className="block"
            >
              <h3 className="text-base font-semibold text-foreground truncate group-hover:text-mapi-primary transition-colors">
                {classItem.name}
              </h3>
            </Link>
            {classItem.subject && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {classItem.subject}
              </p>
            )}
          </div>

          {/* Menu dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/classes/${classItem.id}`}
                  className="flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Turma
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/classes/${classItem.id}/map`}
                  className="flex items-center"
                >
                  <Map className="w-4 h-4 mr-2" />
                  Ver Mapa
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit?.(classItem)}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate?.(classItem.id)}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(classItem.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {/* Ano */}
          {classItem.year && (
            <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
              Ano {classItem.year}
            </span>
          )}

          {/* Período */}
          {classItem.period && (
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", periodColor)}
            >
              {classItem.period}
            </Badge>
          )}
        </div>

        {/* Footer: contagens */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Alunos */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span className="font-medium text-foreground">
              {studentCount}
            </span>
            <span>aluno{studentCount !== 1 ? "s" : ""}</span>
          </div>

          {/* Badge de necessidades especiais */}
          {needsCount > 0 && (
            <div
              className="flex items-center gap-1 text-xs text-mapi-warning bg-amber-50 px-2 py-1 rounded-full"
              title={`${needsCount} aluno${needsCount > 1 ? "s" : ""} com necessidades especiais`}
            >
              <Accessibility className="w-3 h-3" />
              <span className="font-medium">{needsCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Ação rápida no hover (mobile: sempre visível) */}
      <Link
        href={`/dashboard/classes/${classItem.id}/map`}
        className="absolute bottom-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Abrir Mapa"
      >
        <div className="w-9 h-9 bg-mapi-primary/10 hover:bg-mapi-primary/20 rounded-full flex items-center justify-center transition-colors">
          <Map className="w-4 h-4 text-mapi-primary" />
        </div>
      </Link>
    </div>
  );
}
