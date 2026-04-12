import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db/prisma";

/**
 * GET /api/seating?classId=xxx - Lista mapas de uma turma
 */
export async function GET(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "classId is required" }, { status: 400 });
    }

    const maps = await prisma.seatingMap.findMany({
      where: { class: { id: classId, teacherId: user.id } },
      include: {
        positions: {
          include: { student: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ maps });
  } catch (error) {
    console.error("Error fetching seating maps:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/seating - Salva um mapa de assentos
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { classId, layoutType, positions, name } = body;

    if (!classId || !layoutType || !positions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verifica se a turma pertence ao usuário
    const classItem = await prisma.class.findFirst({
      where: { id: classId, teacherId: user.id },
    });

    if (!classItem) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Cria o mapa com posições
    const seatingMap = await prisma.seatingMap.create({
      data: {
        classId,
        name: name || `Mapa ${new Date().toLocaleDateString("pt-BR")}`,
        layoutType,
        layoutConfig: { positions },
        positions: {
          create: positions.map((pos) => ({
            studentId: pos.studentId,
            positionX: pos.positionX,
            positionY: pos.positionY,
            deskId: pos.deskId,
          })),
        },
      },
      include: {
        positions: true,
      },
    });

    return NextResponse.json({ seatingMap }, { status: 201 });
  } catch (error) {
    console.error("Error saving seating map:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
