"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTeacher } from "@/lib/contexts/teacher-context";
import { signOut } from "@/lib/supabase/actions";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  User,
  Home,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Mapeia pathname para breadcrumb
 */
const breadcrumbMap = {
  "/dashboard": { label: "Dashboard", href: "/dashboard" },
  "/dashboard/classes": { label: "Minhas Turmas", href: "/dashboard/classes" },
  "/dashboard/classes/[classId]": { label: "Visão Geral", href: null },
  "/dashboard/classes/[classId]/map": { label: "Mapa da Sala", href: null },
  "/dashboard/classes/[classId]/students": { label: "Alunos", href: null },
  "/dashboard/classes/[classId]/accessibility": {
    label: "Acessibilidade",
    href: null,
  },
};

/**
 * TopBar com breadcrumb dinâmico e botão contextual "Nova Turma"
 * @param {Object} props
 * @param {React.ReactNode} [props.action]
 */
export function TopBar({ action }) {
  const pathname = usePathname();
  const { teacher } = useTeacher();

  const initials = teacher?.name
    ? teacher.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "PR";

  // Monta breadcrumb
  const breadcrumbs = buildBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b px-4 sm:px-6 py-3 flex items-center gap-4">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-muted-foreground flex-1 min-w-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Home className="w-4 h-4" />
        </Link>
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            {crumb.href && i < breadcrumbs.length - 1 ? (
              <Link
                href={crumb.href}
                className="hover:text-foreground transition-colors truncate"
              >
                {crumb.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate",
                  i === breadcrumbs.length - 1 &&
                  "font-medium text-foreground"
                )}
              >
                {crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>

      {/* Ação contextual */}
      {action && <div>{action}</div>}

      {/* Avatar do professor */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 shrink-0">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-mapi-primary text-white text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm hidden sm:inline truncate max-w-[120px]">
              {teacher?.name?.split(" ")[0] || "Professor"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem disabled>
            <User className="w-4 h-4 mr-2" />
            <span className="truncate">{teacher?.email || "Sem e-mail"}</span>
          </DropdownMenuItem>
          {teacher?.school && (
            <DropdownMenuItem disabled>
              {teacher.school}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            Plano: <span className="ml-1 font-medium">{teacher?.planType || "FREE"}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form action={signOut} className="w-full">
              <button
                type="submit"
                className="flex items-center w-full text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

/**
 * Monta array de breadcrumbs a partir do pathname
 * @param {string} pathname
 * @returns {Array<{label: string, href: string|null}>}
 */
function buildBreadcrumbs(pathname) {
  /** @type {Array<{label: string, href: string|null}>} */
  const crumbs = [];

  // /dashboard
  if (pathname.startsWith("/dashboard/classes/")) {
    // Turma específica
    const parts = pathname.split("/").filter(Boolean);
    // parts = ['dashboard', 'classes', ':classId', ...sub]

    crumbs.push({ label: "Minhas Turmas", href: "/dashboard/classes" });

    if (parts.length >= 4) {
      const classId = parts[3];
      // Tenta obter nome da turma — para Server Component seria ideal, aqui usamos genérico
      crumbs.push({ label: "Turma", href: `/dashboard/classes/${classId}` });

      if (parts.length >= 5) {
        const sub = parts[4]; // map, students, accessibility
        const labels = {
          map: "Mapa da Sala",
          students: "Alunos",
          accessibility: "Acessibilidade",
        };
        crumbs.push({
          label: labels[sub] || sub,
          href: null,
        });
      }
    }
  } else if (pathname === "/dashboard/classes") {
    crumbs.push({ label: "Minhas Turmas", href: null });
  } else if (pathname === "/dashboard") {
    crumbs.push({ label: "Dashboard", href: null });
  }

  return crumbs;
}
