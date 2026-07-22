import { auth } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/require-permission";
import { hasPermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { findMany } from "../repositories/audit-log.repository";

export async function list(params: {
  page: number;
  pageSize: number;
  entityType?: string;
  userId?: string;
  search?: string;
}) {
  const session = await auth();
  requirePermission(session, "audit-logs:read");

  const businessId = session!.user.businessId;

  if (!hasPermission(session!.user.permissions, "*")) {
    const teamMembers = await prisma.user.findMany({
      where: { managerId: session!.user.userId },
      select: { id: true },
    });
    const teamIds = [session!.user.userId, ...teamMembers.map((u) => u.id)];
    return findMany({
      ...params,
      userIds: teamIds,
      ...(businessId && businessId !== "all" ? { businessId } : {}),
    });
  }

  return findMany({
    ...params,
    ...(businessId && businessId !== "all" ? { businessId } : {}),
  });
}
