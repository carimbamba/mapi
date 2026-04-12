/**
 * Health Check Endpoint
 *
 * GET /api/health
 * Retorna 200 se a aplicação está saudável.
 * Usado por monitoramento (Vercel, UptimeRobot, etc.)
 */

import { NextResponse } from "next/server";

export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0-mvp",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  };

  return NextResponse.json(health, { status: 200 });
}
