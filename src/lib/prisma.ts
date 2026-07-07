import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { env } from '@/config/env'

/*
 * Prisma client singleton.
 *
 * Uses the MariaDB driver adapter for the runtime connection.
 * The schema.prisma datasource URL is used by the Prisma CLI (migrations, db push).
 *
 * In development, the singleton is stored on globalThis to prevent
 * connection exhaustion when Next.js hot-reloads the module.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaMariaDb(env.DATABASE_URL)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
