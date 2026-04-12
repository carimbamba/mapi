import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Plus, Users, Map, BookOpen } from "lucide-react";
import { OnboardingChecklistClient } from "@/components/onboarding/OnboardingChecklistClient";
import { getOnboardingProgress } from "@/lib/actions/onboarding-actions";

export const dynamic = "force-dynamic";

/**
 * Dashboard principal — com onboarding integrado
 * @param {Object} props
 * @param {Object} props.params
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  if (!supabase) {
    return <div>Erro de configuração</div>;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Busca dados do professor
  const teacher = await prisma.teacher.findUnique({
    where: { supabaseUserId: user.id },
  });

  if (!teacher) return null;

  // Onboarding progress
  const { completedSteps, percentage, allCompleted } = await getOnboardingProgress(teacher.id);

  // Stats
  const classCount = await prisma.class.count({
    where: { teacherId: teacher.id, deletedAt: null },
  });

  const studentCount = await prisma.student.count({
    where: {
      class: { teacherId: teacher.id, deletedAt: null },
      deletedAt: null,
    },
  });

  const mapCount = await prisma.seatingMap.count({
    where: {
      class: { teacherId: teacher.id },
    },
  });

  // Turmas recentes
  const classes = await prisma.class.findMany({
    where: { teacherId: teacher.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 6,
    select: {
      id: true,
      name: true,
      subject: true,
      period: true,
      year: true,
      studentCount: true,
    },
  });

  // Verifica se é novo professor (criado nas últimas 24h sem turmas)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const isNewTeacher = teacher.createdAt >= twentyFourHoursAgo && classCount === 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Olá, ${teacher.name?.split(" ")[0] || "Professor"}! Aqui está um resumo das suas turmas.`}
      >
        <Link href="/dashboard/classes/new">
          <Button data-onboarding="new-class">
            <Plus className="w-4 h-4 mr-1" />
            Nova Turma
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main content — 3/4 */}
        <div className="xl:col-span-3">
          {/* Welcome wizard para novos professores */}
          {isNewTeacher && (
            <Card className="mb-6 border-mapi-primary/30 bg-gradient-to-r from-mapi-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">👋</span>
                  Bem-vindo ao MAPI, {teacher.name?.split(" ")[0]}!
                </CardTitle>
                <CardDescription>
                  Crie seu primeiro mapa de sala em 3 minutos. É grátis!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/dashboard/classes/new">
                    <Button className="bg-mapi-primary hover:bg-mapi-primary/90">
                      <Plus className="w-4 h-4 mr-1.5" />
                      Criar Primeira Turma
                    </Button>
                  </Link>
                  <Link href="/dashboard/classes">
                    <Button variant="outline">
                      Ver turmas existentes
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Turmas</CardDescription>
                <CardTitle className="text-3xl">{classCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4 mr-1" />
                  Turmas ativas
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Alunos</CardDescription>
                <CardTitle className="text-3xl">{studentCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-1" />
                  Total de alunos
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Mapas Criados</CardDescription>
                <CardTitle className="text-3xl">{mapCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Map className="w-4 h-4 mr-1" />
                  Mapas de sala
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick access */}
          <Card>
            <CardHeader>
              <CardTitle>Turmas Recentes</CardTitle>
              <CardDescription>Suas últimas turmas organizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classes.map((classItem) => (
                    <Link
                      key={classItem.id}
                      href={`/dashboard/classes/${classItem.id}`}
                      data-onboarding="view-map"
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer border-mapi-primary/20 hover:border-mapi-primary/50">
                        <CardHeader>
                          <CardTitle className="text-lg">{classItem.name}</CardTitle>
                          <CardDescription>
                            {classItem.subject || "Sem disciplina"} •{" "}
                            {classItem.period || "Período não definido"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">
                            {classItem.studentCount || 0} alunos • Ano{" "}
                            {classItem.year}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não criou nenhuma turma.
                  </p>
                  <Link href="/dashboard/classes/new">
                    <Button>Criar Primeira Turma</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — 1/4: Onboarding Checklist */}
        <div className="xl:col-span-1">
          {!allCompleted && (
            <OnboardingChecklistClient
              teacherId={teacher.id}
              completedSteps={completedSteps}
              percentage={percentage}
              allCompleted={allCompleted}
            />
          )}

          {/* Upgrade prompt para FREE */}
          {teacher.planType === "FREE" && (
            <Card className="mt-4 border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  ⭐ Faça Upgrade
                </CardTitle>
                <CardDescription className="text-xs">
                  Desbloqueie geração automática, Diário de Bordo e mais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/login?upgrade=true">
                  <Button size="sm" className="w-full text-xs bg-mapi-primary hover:bg-mapi-primary/90">
                    Ver planos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
