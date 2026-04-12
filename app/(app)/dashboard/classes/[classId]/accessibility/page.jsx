import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";
import { TopBar } from "@/components/layout/TopBar";
import { StudentProfile } from "@/components/accessibility/StudentProfile";
import { ConditionBadge } from "@/components/accessibility/ConditionBadge";
import { getGuide } from "@/lib/accessibility/condition-guides";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Filter,
  Users,
  BookOpen,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const dynamic = "force-dynamic";

/**
 * Página de Acessibilidade — Gestão de alunos com necessidades
 *
 * Grid de cards de alunos com necessidades + filtros por condição.
 * Alunos sem necessidades em seção colapsável ao final.
 */
export default async function AccessibilityPage({ params }) {
  const { classId } = await params;

  const supabase = await createClient();
  if (!supabase) redirect("/login");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const teacher = await prisma.teacher.findUnique({
    where: { supabaseUserId: user.id },
  });
  if (!teacher) redirect("/login");

  // Busca turma
  const classItem = await prisma.class.findFirst({
    where: { id: classId, teacherId: teacher.id, deletedAt: null },
  });
  if (!classItem) redirect("/dashboard/classes");

  // Busca alunos — SEM diagnosis_notes (dado sensível)
  const students = await prisma.student.findMany({
    where: { classId, deletedAt: null },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      hasAccessibilityNeeds: true,
      diagnosisType: true,
      prioritySeating: true,
      parentConsent: true,
    },
  });

  const studentsWithNeeds = students.filter((s) => s.hasAccessibilityNeeds);
  const studentsWithoutNeeds = students.filter((s) => !s.hasAccessibilityNeeds);

  // Busca últimas entradas do diário para cada aluno
  const lastLogs = {};
  for (const student of studentsWithNeeds) {
    const log = await prisma.accessibilityLog.findFirst({
      where: { studentId: student.id, deletedAt: null },
      orderBy: { logDate: "desc" },
    });
    if (log) {
      lastLogs[student.id] = log;
    }
  }

  return (
    <div className="min-h-screen bg-mapi-background">
      <TopBar
        action={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">{classItem.name}</span>
          </div>
        }
      />

      <main className="p-4 sm:p-6 lg:p-8 ml-0 lg:ml-64">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Acessibilidade
          </h1>
          <p className="text-muted-foreground mt-1">
            {studentsWithNeeds.length} aluno{studentsWithNeeds.length !== 1 ? "s" : ""}{" "}
            com necessidades específicas
            {studentsWithoutNeeds.length > 0 && (
              <span className="ml-1">
                ({studentsWithoutNeeds.length} sem necessidades registradas)
              </span>
            )}
          </p>
        </div>

        {studentsWithNeeds.length === 0 && studentsWithoutNeeds.length === 0 ? (
          /* Empty state */
          <Card>
            <CardContent className="text-center py-20">
              <Users className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Nenhum aluno cadastrado
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Adicione alunos na seção de Alunos para acompanhar necessidades
                específicas e manter o Diário de Bordo.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Alunos com necessidades */}
            {studentsWithNeeds.length > 0 && (
              <StudentsGrid
                students={studentsWithNeeds}
                lastLogs={lastLogs}
                classId={classId}
              />
            )}

            {/* Alunos sem necessidades — colapsável */}
            {studentsWithoutNeeds.length > 0 && (
              <>
                <Separator className="my-8" />
                <Collapsible defaultOpen={false}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between mb-4">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Alunos sem necessidades registradas ({studentsWithoutNeeds.length})
                      </span>
                      <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {studentsWithoutNeeds.map((student) => {
                        const initials = student.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase();

                        return (
                          <Card key={student.id} className="hover:shadow-sm transition-shadow">
                            <CardContent className="p-4 flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-medium">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm truncate">
                                  {student.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Sem necessidades registradas
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}
          </>
        )}
      </main>

      {/* Student Profile Sheet — client-side */}
      <ClientStudentProfile />
    </div>
  );
}

/**
 * Grid de alunos com necessidades
 */
function StudentsGrid({ students, lastLogs, classId }) {
  return (
    <div className="space-y-4">
      {/* Filtros por condição */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Filtrar por:</span>
        <div className="flex gap-1.5 flex-wrap">
          <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-muted">
            Todos
          </Badge>
          {["TEA", "TDAH", "DISLEXIA", "DYS", "ALTAS_HABILIDADES"].map((type) => {
            const count = students.filter(
              (s) => s.diagnosisType === type
            ).length;
            if (count === 0) return null;

            return (
              <Badge
                key={type}
                variant="outline"
                className="text-xs cursor-pointer hover:bg-muted"
              >
                <ConditionBadge condition={type} showLabel size="sm" />
                <span className="ml-1 text-muted-foreground">{count}</span>
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map((student) => {
          const guide = student.diagnosisType
            ? getGuide(student.diagnosisType)
            : null;
          const initials = student.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
          const lastLog = lastLogs[student.id];

          return (
            <Card
              key={student.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-mapi-primary text-white text-sm font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base truncate">
                      {student.name}
                    </CardTitle>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {student.diagnosisType && (
                        <ConditionBadge
                          condition={student.diagnosisType}
                          showLabel
                          size="sm"
                        />
                      )}
                      {student.prioritySeating && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                        >
                          Assento prioritário
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Última entrada no diário */}
                {lastLog ? (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate">
                        {formatDistanceToNow(new Date(lastLog.logDate), {
                          locale: ptBR,
                          addSuffix: true,
                        })}
                      </p>
                      <p className="truncate mt-0.5">
                        {lastLog.description.substring(0, 60)}
                        {lastLog.description.length > 60 ? "..." : ""}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {lastLog.visibility === "PRIVATE" ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                        <span className="text-[10px]">
                          {lastLog.visibility === "PRIVATE"
                            ? "Privado"
                            : lastLog.visibility === "SCHOOL"
                              ? "Escola"
                              : "Família"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Nenhuma entrada no diário
                  </p>
                )}

                {/* Botão Ver Perfil */}
                <div className="mt-3 pt-3 border-t flex justify-end">
                  <Button size="sm" variant="outline" className="text-xs">
                    Ver Perfil Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Client wrapper para StudentProfile
 */
function ClientStudentProfile() {
  "use client";

  const { useState } = require("react");
  const { StudentProfile } = require("@/components/accessibility/StudentProfile");

  const [selectedStudent, setSelectedStudent] = useState(null);

  return (
    <StudentProfile
      open={!!selectedStudent}
      onOpenChange={(open) => !open && setSelectedStudent(null)}
      student={selectedStudent}
    />
  );
}
