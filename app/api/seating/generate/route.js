/**
 * API Route — Geração Assíncrona de Mapa
 *
 * POST /api/seating/generate
 *
 * Alternativa para chamada do algoritmo de forma assíncrona.
 * Útil para turmas grandes onde o processamento pode demorar.
 *
 * Rate limit: 10 gerações/hora por professor.
 *
 * Body:
 *   { classId, layoutType?, rows?, cols?, options? }
 *
 * Response:
 *   { seatingMapId, placements, warnings, score, rateLimitRemaining }
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMap } from "@/lib/actions/seating-actions";
import prisma from "@/lib/db/prisma";

/**
 * Rate limit em memória (compartilhado com a Server Action)
 * @type {Map<string, number[]>}
 */
const generationLog = new Map();

function checkRateLimit(teacherId) {
  const now = Date.now();
  const oneHourAgo = now - 3600000;

  const timestamps = generationLog.get(teacherId) || [];
  const recent = timestamps.filter((t) => t > oneHourAgo);

  if (recent.length >= 10) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(recent[0] + 3600000),
    };
  }

  recent.push(now);
  generationLog.set(teacherId, recent);

  return {
    allowed: true,
    remaining: 10 - recent.length,
    resetAt: new Date(now + 3600000),
  };
}

/**
 * POST /api/seating/generate
 */
export async function POST(request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Erro de configuração do servidor." },
        { status: 500 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const teacher = await prisma.teacher.findUnique({
      where: { supabaseUserId: user.id },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: "Professor não encontrado." },
        { status: 404 }
      );
    }

    // Parse body
    const body = await request.json();
    const { classId, layoutType, rows, cols, options = {} } = body;

    if (!classId) {
      return NextResponse.json(
        { error: "classId é obrigatório." },
        { status: 400 }
      );
    }

    // Rate limit
    const rateLimit = checkRateLimit(teacher.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: "Limite de gerações excedido.",
          rateLimitRemaining: 0,
          rateLimitResetAt: rateLimit.resetAt.toISOString(),
        },
        { status: 429 }
      );
    }

    // Chama a Server Action
    const result = await generateMap(classId, teacher.id, {
      layoutType,
      rows,
      cols,
      ...options,
    });

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.includes("Limite") ? 429 : 400 }
      );
    }

    return NextResponse.json({
      seatingMapId: result.data.map.id,
      placements: result.data.placements,
      warnings: result.data.warnings,
      score: result.data.score,
      rateLimitRemaining: result.data.rateLimitRemaining,
    });
  } catch (error) {
    console.error("[API] POST /api/seating/generate error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
