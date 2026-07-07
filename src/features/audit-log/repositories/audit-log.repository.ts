import { prisma } from "@/lib/prisma";
import { skipTake } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";

export async function findMany(params: {
  page: number;
  pageSize: number;
  entityType?: string;
  userId?: string;
}) {
  const where: Prisma.AuditLogWhereInput = {
    ...(params.entityType && { entityType: params.entityType }),
    ...(params.userId && { userId: params.userId }),
  };

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      ...skipTake(params),
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data, total };
}
