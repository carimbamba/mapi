import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";
import { ClassCard } from "@/components/seating/ClassCard";
import { TopBar } from "@/components/layout/TopBar";
import { ClientClassFormTrigger } from "@/components/forms/ClassFormTrigger";
import { BookOpen } from "lucide-react";

/**
 * Página de Listagem de Turmas — Server Component
 *
 * Grid responsivo: 3 colunas (desktop), 2 (tablet), 1 (mobile)
 * Busca turmas via Prisma, filtra por teacher_id (multi-tenancy).
 */
export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Busca teacher
  const teacher = await prisma.teacher.findUnique({
    where: { supabaseUserId: user.id },
  });

  if (!teacher) {
    redirect("/login");
  }

  // Busca turmas com contagem de alunos
  const classes = await prisma.class.findMany({
    where: {
      teacherId: teacher.id,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { students: { where: { deletedAt: null } } },
      },
      students: {
        where: { deletedAt: null, hasAccessibilityNeeds: true },
        select: { id: true },
      },
    },
  });

  // Contagem de alunos com necessidades por turma
  const needsMap = {};
  classes.forEach((c) => {
    needsMap[c.id] = c.students.length;
  });

  return (
    <div className="min-h-screen bg-mapi-background">
      {/* TopBar com botão Nova Turma */}
      <TopBar action={<ClientClassFormTrigger teacherId={teacher.id} />} />

      <main className="p-4 sm:p-6 lg:p-8 ml-0 lg:ml-64">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Minhas Turmas
          </h1>
          <p className="text-muted-foreground mt-1">
            {classes.length === 0
              ? "Crie sua primeira turma para começar a organizar sua sala."
              : `${classes.length} turma${classes.length > 1 ? "s" : ""} cadastrada${classes.length > 1 ? "s" : ""}.`}
          </p>
        </div>

        {/* Grid de turmas */}
        {classes.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-mapi-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-mapi-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma turma cadastrada
            </h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              Comece criando sua primeira turma. Você poderá adicionar alunos e
              criar mapas de assentos depois.
            </p>
            <ClientClassFormTrigger teacherId={teacher.id} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((classItem) => (
              <ClassCard
                key={classItem.id}
                classItem={{
                  ...classItem,
                  createdAt: classItem.createdAt.toISOString(),
                  updatedAt: classItem.updatedAt.toISOString(),
                  deletedAt: classItem.deletedAt?.toISOString() || null,
                }}
                needsCount={needsMap[classItem.id] || 0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
