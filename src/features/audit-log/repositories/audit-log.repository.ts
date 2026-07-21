import { prisma } from "@/lib/prisma";
import { skipTake } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";

export async function findMany(params: {
  page: number;
  pageSize: number;
  entityType?: string;
  excludeEntityType?: string[];
  userId?: string;
  userIds?: string[];
  businessId?: string;
  search?: string;
}) {
  const where: Prisma.AuditLogWhereInput = {
    ...(params.entityType && { entityType: params.entityType }),
    ...(params.excludeEntityType && params.excludeEntityType.length > 0 && {
      entityType: { notIn: params.excludeEntityType },
    }),
    ...(params.userId && { userId: params.userId }),
    ...(params.userIds && { userId: { in: params.userIds } }),
    ...(params.businessId && { businessId: params.businessId }),
    ...(params.search && {
      OR: [
        { action: { contains: params.search } },
        { entityType: { contains: params.search } },
        { entityId: { contains: params.search } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      ...skipTake(params),
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const userIds = [...new Set(data.map((d) => d.userId))];
  const users = userIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u.name]));

  return { data: data.map((d) => ({ ...d, userName: userMap.get(d.userId) ?? "System" })), total };
}
