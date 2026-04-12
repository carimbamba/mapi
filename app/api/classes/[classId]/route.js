import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/classes/[classId] - Busca uma turma específica
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId } = await params;

    const classItem = await prisma.class.findFirst({
      where: { id: classId, teacherId: user.id },
    });

    if (!classItem) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({ class: classItem });
  } catch (error) {
    console.error("Error fetching class:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/classes/[classId] - Atualiza uma turma
 */
export async function PUT(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId } = await params;
    const body = await request.json();

    const existing = await prisma.class.findFirst({
      where: { id: classId, teacherId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const updated = await prisma.class.update({
      where: { id: classId },
      data: {
        name: body.name || existing.name,
        subject: body.subject !== undefined ? body.subject : existing.subject,
        year: body.year || existing.year,
        period: body.period !== undefined ? body.period : existing.period,
      },
    });

    return NextResponse.json({ class: updated });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/classes/[classId] - Exclui uma turma
 */
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId } = await params;

    const existing = await prisma.class.findFirst({
      where: { id: classId, teacherId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    await prisma.class.delete({
      where: { id: classId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
