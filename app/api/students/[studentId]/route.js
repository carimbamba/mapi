import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/students/[studentId] - Busca um aluno específico
 */
export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await params;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });

    if (!student || student.class.teacherId !== user.id) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/students/[studentId] - Atualiza um aluno
 */
export async function PUT(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await params;
    const body = await request.json();

    const existing = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });

    if (!existing || existing.class.teacherId !== user.id) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const updated = await prisma.student.update({
      where: { id: studentId },
      data: {
        name: body.name || existing.name,
        hasAccessibilityNeeds: body.hasAccessibilityNeeds !== undefined ? body.hasAccessibilityNeeds : existing.hasAccessibilityNeeds,
        diagnosisType: body.diagnosisType !== undefined ? body.diagnosisType : existing.diagnosisType,
        diagnosisNotes: body.diagnosisNotes !== undefined ? body.diagnosisNotes : existing.diagnosisNotes,
        prioritySeating: body.prioritySeating !== undefined ? body.prioritySeating : existing.prioritySeating,
      },
    });

    return NextResponse.json({ student: updated });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/students/[studentId] - Exclui um aluno
 */
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await params;

    const existing = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true },
    });

    if (!existing || existing.class.teacherId !== user.id) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    await prisma.student.delete({
      where: { id: studentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
