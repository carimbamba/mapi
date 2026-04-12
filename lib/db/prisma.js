/**
 * Prisma Client Singleton para Next.js
 *
 * Previne múltiplas instâncias durante hot-reload no desenvolvimento.
 * Usa globalThis para persistir a instância entre recarregamentos de módulo.
 *
 * Uso:
 *   import prisma from "@/lib/db/prisma";
 *   const students = await prisma.student.findMany();
 */

import { PrismaClient } from "@prisma/client";

/** @type {import('@prisma/client').PrismaClient | undefined} */
const globalForPrisma = globalThis;

/**
 * Instância singleton do PrismaClient
 * @type {import('@prisma/client').PrismaClient}
 */
const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development"
    ? [{ emit: "event", level: "query" }, { emit: "event", level: "error" }, { emit: "event", level: "warn" }]
    : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;

  // Log de queries no desenvolvimento
  if (process.env.NODE_ENV === "development") {
    prisma.$on("query", (e) => {
      console.log(`[Prisma] ${e.query} — ${e.duration}ms`);
    });

    prisma.$on("error", (e) => {
      console.error(`[Prisma Error] ${e.message}`);
    });

    prisma.$on("warn", (e) => {
      console.warn(`[Prisma Warn] ${e.message}`);
    });
  }
}

// Graceful shutdown em produção
if (process.env.NODE_ENV === "production") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
