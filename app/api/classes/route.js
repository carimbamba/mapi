/**
 * API Routes — Classes
 *
 * GET  /api/classes          — Lista turmas do professor
 * POST /api/classes          — Cria nova turma
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/classes
 */
export async function GET() {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { supabaseUserId: user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const classes = await prisma.class.findMany({
      where: { teacherId: teacher.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ classes });
  } catch (error) {
    console.error("[API] Error fetching classes:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/classes
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { supabaseUserId: user.id },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const body = await request.json();
    const { name, subject, year, period } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        teacherId: teacher.id,
        name,
        subject: subject || null,
        year: year || new Date().getFullYear().toString(),
        period: period || null,
      },
    });

    return NextResponse.json({ class: newClass }, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating class:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
