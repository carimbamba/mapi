import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/logs?studentId=xxx - Lista entradas do diário de bordo
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    // Verifica permissão
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });

    if (!student || student.class.teacherId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const entries = await prisma.accessibilityLog.findMany({
      where: { studentId },
      orderBy: { logDate: "desc" },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/logs - Cria entrada no diário de bordo
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, category, description, visibility } = body;

    if (!studentId || !category || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verifica permissão
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });

    if (!student || student.class.teacherId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const entry = await prisma.accessibilityLog.create({
      data: {
        studentId,
        teacherId: user.id,
        category,
        description,
        visibility: visibility || "private",
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("Error creating log entry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
