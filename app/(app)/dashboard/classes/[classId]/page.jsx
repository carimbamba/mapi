import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Map, Users, Accessibility, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Visão geral de uma turma específica
 * @param {Object} props
 * @param {Promise<{classId: string}>} props.params
 */
export default async function ClassDetailPage(props) {
  const params = await props.params;
  const supabase = await createClient();

  const { data: classItem } = await supabase
    .from("classes")
    .select("*")
    .eq("id", params.classId)
    .single();

  if (!classItem) {
    notFound();
  }

  const { data: students, count: studentCount } = await supabase
    .from("students")
    .select("*", { count: "exact" })
    .eq("class_id", params.classId);

  const { data: maps } = await supabase
    .from("seating_maps")
    .select("*")
    .eq("class_id", params.classId)
    .order("created_at", { ascending: false })
    .limit(1);

  const { data: studentsWithNeeds } = await supabase
    .from("students")
    .select("*")
    .eq("class_id", params.classId)
    .eq("has_accessibility_needs", true);

  return (
    <div>
      <PageHeader title={classItem.name} description={`${classItem.subject || "Sem disciplina"} • ${classItem.period || "Período não definido"} • Ano ${classItem.year}`}>
        <Link href={`/dashboard/classes/${params.classId}/map`}>
          <Button>
            <Map className="w-4 h-4 mr-1" />
            Abrir Mapa
          </Button>
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Alunos</CardDescription>
            <CardTitle className="text-3xl">{studentCount || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-1" />
              Total matriculados
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Acessibilidade</CardDescription>
            <CardTitle className="text-3xl">{studentsWithNeeds?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Accessibility className="w-4 h-4 mr-1" />
              Alunos com necessidades
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mapas</CardDescription>
            <CardTitle className="text-3xl">{maps?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground">
              <Map className="w-4 h-4 mr-1" />
              Mapas criados
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/dashboard/classes/${params.classId}/map`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Map className="w-5 h-5 text-mapi-primary" />
                Mapa da Sala
              </CardTitle>
              <CardDescription>
                Organize os assentos com drag & drop
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href={`/dashboard/classes/${params.classId}/students`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-mapi-primary" />
                Alunos
              </CardTitle>
              <CardDescription>
                Gerencie alunos e perfis de acessibilidade
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href={`/dashboard/classes/${params.classId}/accessibility`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-mapi-primary" />
                Acessibilidade
              </CardTitle>
              <CardDescription>
                Diário de Bordo e guias de manejo
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
