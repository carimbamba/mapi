/**
 * API Routes — Students
 *
 * GET  /api/students?classId=xxx    — Lista alunos de uma turma
 * POST /api/students                — Cria um ou mais alunos
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/students?classId=xxx
 */
export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "classId is required" }, { status: 400 });
    }

    // Verifica se a turma pertence ao professor
    const classItem = await prisma.class.findFirst({
      where: { id: classId, teacherId: teacher.id, deletedAt: null },
    });

    if (!classItem) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const students = await prisma.student.findMany({
      where: { classId, deletedAt: null },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("[API] Error fetching students:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/students
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

    // Importação em lote
    if (body.students && Array.isArray(body.students)) {
      const created = await prisma.student.createMany({
        data: body.students.map((s) => ({
          classId: s.classId,
          name: s.name,
          hasAccessibilityNeeds: s.hasAccessibilityNeeds || false,
          prioritySeating: s.prioritySeating || false,
          parentConsent: s.parentConsent || false,
        })),
      });

      return NextResponse.json({ created: created.count }, { status: 201 });
    }

    // Criação individual
    const { classId, name, hasAccessibilityNeeds, diagnosisType, diagnosisNotes, prioritySeating, parentConsent } = body;

    if (!classId || !name) {
      return NextResponse.json({ error: "classId and name are required" }, { status: 400 });
    }

    // Verifica se a turma pertence ao professor
    const classItem = await prisma.class.findFirst({
      where: { id: classId, teacherId: teacher.id, deletedAt: null },
    });

    if (!classItem) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const student = await prisma.student.create({
      data: {
        classId,
        name,
        hasAccessibilityNeeds: hasAccessibilityNeeds || false,
        diagnosisType: diagnosisType || null,
        diagnosisNotes: diagnosisNotes || null,
        prioritySeating: prioritySeating || false,
        parentConsent: parentConsent || false,
      },
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating student(s):", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
