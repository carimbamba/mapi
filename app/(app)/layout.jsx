/**
 * App Layout — Layout Protegido do Dashboard
 *
 * Server Component que:
 * 1. Verifica sessão server-side via Supabase
 * 2. Redireciona para /login se não autenticado
 * 3. Busca dados do professor do banco
 * 4. Renderiza Sidebar + TopBar + children
 * 5. Passa dados do professor via React Context
 */

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { TeacherProvider } from "@/lib/contexts/teacher-context";

export const dynamic = "force-dynamic";

/**
 * Layout protegido do dashboard
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export default async function AppLayout({ children }) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login");
  }

  // Verifica sessão server-side
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Busca dados do professor do banco
  const teacher = await prisma.teacher.findUnique({
    where: { supabaseUserId: user.id },
  });

  if (!teacher) {
    // Usuário autenticado mas sem registro no banco — cria automaticamente
    const { getOrCreateTeacher } = await import("@/lib/supabase/actions");
    await getOrCreateTeacher(user);

    // Busca novamente
    const newTeacher = await prisma.teacher.findUnique({
      where: { supabaseUserId: user.id },
    });

    if (!newTeacher) {
      redirect("/login");
    }

    return (
      <TeacherProvider teacher={newTeacher}>
        <DashboardShell />
      </TeacherProvider>
    );
  }

  return (
    <TeacherProvider teacher={teacher}>
      <DashboardShell>{children}</DashboardShell>
    </TeacherProvider>
  );
}

/**
 * Shell do Dashboard — Sidebar + TopBar + Content
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
function DashboardShell({ children }) {
  return (
    <div className="min-h-screen bg-mapi-background">
      <Sidebar />
      <div className="ml-56 flex flex-col min-h-screen">
        <TopBar />
        <main id="main-content" className="flex-1 p-6" role="main" aria-label="Conteúdo principal">
          {children}
        </main>
      </div>
    </div>
  );
}
