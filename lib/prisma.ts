import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/app/generated/prisma/client'

// Em desenvolvimento o Next.js recarrega os módulos a cada mudança de código
// (hot reload), o que recriaria o PrismaClient (e o pool de conexões) a cada
// vez. Guardamos a instância em `globalThis` para reutilizá-la entre reloads.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function criarPrismaClient() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? criarPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
