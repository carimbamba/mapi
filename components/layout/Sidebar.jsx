"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTeacher } from "@/lib/contexts/teacher-context";
import { signOut } from "@/lib/supabase/actions";
import {
  LayoutGrid,
  Users,
  Settings,
  GraduationCap,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/**
 * Links de navegação principais
 */
const mainNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/classes", label: "Minhas Turmas", icon: Users },
];

/**
 * Sidebar de navegação — desktop fixo, mobile collapsible
 */
export function Sidebar() {
  const { teacher } = useTeacher();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Extrai ID da turma atual para sub-menu
  const classIdMatch = pathname.match(/\/dashboard\/classes\/([a-f0-9-]+)/i);
  const currentClassId = classIdMatch ? classIdMatch[1] : null;

  const classSubLinks = currentClassId
    ? [
      {
        href: `/dashboard/classes/${currentClassId}`,
        label: "Visão Geral",
        icon: LayoutGrid,
      },
      {
        href: `/dashboard/classes/${currentClassId}/map`,
        label: "Mapa da Sala",
        icon: GraduationCap,
      },
      {
        href: `/dashboard/classes/${currentClassId}/students`,
        label: "Alunos",
        icon: Users,
      },
      {
        href: `/dashboard/classes/${currentClassId}/accessibility`,
        label: "Acessibilidade",
        icon: Settings,
      },
    ]
    : [];

  const initials = teacher?.name
    ? teacher.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
    : "PR";

  /**
   * Renderiza os links de navegação
   * @param {Object} props
   * @param {typeof mainNavLinks} props.links
   * @param {boolean} props.isSub
   */
  function NavLinks({ links, isSub = false }) {
    return links.map((item) => {
      const Icon = item.icon;
      const isActive = isSub
        ? pathname === item.href
        : pathname === item.href || (!isSub && pathname.startsWith(item.href) && item.href !== "/dashboard/classes");

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
            isActive
              ? "bg-mapi-primary/10 text-mapi-primary shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">{item.label}</span>
        </Link>
      );
    });
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-50 p-2 rounded-lg bg-card border shadow-sm lg:hidden"
        aria-label="Abrir menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-40 bg-card border-r flex flex-col transition-transform duration-300 ease-in-out",
          "w-64 lg:w-64",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-5 border-b flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-mapi-primary rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M2 10h20" />
                <path d="M6 10v4" />
                <path d="M10 10v4" />
                <path d="M14 10v4" />
                <path d="M18 10v4" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-lg text-foreground tracking-tight">MAPI</span>
              <span className="block text-[10px] text-muted-foreground -mt-0.5">
                Mapa Interativo
              </span>
            </div>
          </Link>
          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 rounded hover:bg-muted text-muted-foreground"
            aria-label={collapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLinks links={mainNavLinks} />

          {/* Sub-menu da turma atual */}
          {classSubLinks.length > 0 && (
            <>
              <div className="pt-4 pb-1.5 px-3">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Turma Atual
                </span>
              </div>
              <NavLinks links={classSubLinks} isSub />
            </>
          )}
        </nav>

        {/* Footer — professor info */}
        <div className="p-3 border-t space-y-2">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="bg-mapi-primary text-white text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {teacher?.name || "Professor"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {teacher?.school || "Sem escola"}
              </p>
            </div>
          </div>

          {/* Logout */}
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
