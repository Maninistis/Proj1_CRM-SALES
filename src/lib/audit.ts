import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { getCurrentBusinessId } from "@/lib/auth/business";

type AuditInput = {
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  previousState?: unknown;
  newState?: unknown;
  metadata?: unknown;
};

export async function audit(input: AuditInput) {
  const businessId = await getCurrentBusinessId();
  await prisma.auditLog.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      userId: input.userId,
      businessId: businessId ?? "",
      previousState: input.previousState as Prisma.InputJsonValue | undefined,
      newState: input.newState as Prisma.InputJsonValue | undefined,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
