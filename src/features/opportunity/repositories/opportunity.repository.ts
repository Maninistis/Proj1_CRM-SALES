import { prisma } from "@/lib/prisma";
import { skipTake } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";

const oppInclude = {
  lead: {
    select: { id: true, firstName: true, lastName: true, documentNo: true },
  },
  assignedTo: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
} satisfies Prisma.OpportunityInclude;

export async function findMany(params: {
  page: number;
  pageSize: number;
  search?: string;
  stage?: string;
  status?: string;
  deleted?: boolean;
  scopeUserId?: string;
}) {
  const where: Prisma.OpportunityWhereInput = {
    ...(params.scopeUserId && {
      OR: [{ assignedToId: params.scopeUserId }, { createdById: params.scopeUserId }],
    }),
    ...(params.deleted
      ? { deletedAt: { not: null } }
      : { deletedAt: null }),
    ...(params.stage && { stage: params.stage }),
    ...(params.status && { status: params.status }),
    ...(params.search && {
      OR: [
        { title: { contains: params.search } },
        { documentNo: { contains: params.search } },
        { lead: { firstName: { contains: params.search } } },
        { lead: { lastName: { contains: params.search } } },
        { lead: { company: { contains: params.search } } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.opportunity.findMany({
      where,
      include: oppInclude,
      ...skipTake({ page: params.page, pageSize: params.pageSize }),
      orderBy: { createdAt: "desc" },
    }),
    prisma.opportunity.count({ where }),
  ]);

  return { data, total };
}

export async function findById(id: string, scopeUserId?: string) {
  return prisma.opportunity.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(scopeUserId && {
        OR: [{ assignedToId: scopeUserId }, { createdById: scopeUserId }],
      }),
    },
    include: oppInclude,
  });
}

export async function findByIdIncludingDeleted(id: string) {
  return prisma.opportunity.findUnique({
    where: { id },
    include: oppInclude,
  });
}

export async function findByLeadId(leadId: string) {
  return prisma.opportunity.findFirst({
    where: { leadId, deletedAt: null },
  });
}

export async function create(data: {
  documentNo: string;
  leadId: string;
  title: string;
  description?: string;
  estimatedValue: number;
  expectedCloseDate: Date;
  assignedToId?: string;
  createdById: string;
}) {
  return prisma.opportunity.create({
    data: {
      documentNo: data.documentNo,
      leadId: data.leadId,
      title: data.title,
      description: data.description || null,
      estimatedValue: data.estimatedValue,
      expectedCloseDate: data.expectedCloseDate,
      assignedToId: data.assignedToId || null,
      createdById: data.createdById,
    },
    include: oppInclude,
  });
}

export async function update(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    estimatedValue: number;
    expectedCloseDate: Date;
    stage: string;
    assignedToId: string;
    lossReason: string;
  }>
) {
  return prisma.opportunity.update({
    where: { id },
    data: {
      ...data,
      description: data.description ?? undefined,
      assignedToId: data.assignedToId ?? undefined,
      lossReason: data.lossReason ?? undefined,
    },
    include: oppInclude,
  });
}

export async function updateStageAndStatus(
  id: string,
  data: { stage?: string; status?: string; lossReason?: string | null }
) {
  return prisma.opportunity.update({
    where: { id },
    data: {
      ...(data.stage && { stage: data.stage }),
      ...(data.status && { status: data.status }),
      ...(data.lossReason !== undefined && { lossReason: data.lossReason }),
    },
    include: oppInclude,
  });
}

export async function softDelete(id: string) {
  return prisma.opportunity.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function restore(id: string) {
  return prisma.opportunity.update({
    where: { id },
    data: { deletedAt: null },
    include: oppInclude,
  });
}

export type OpportunityWithRelations = Prisma.OpportunityGetPayload<{
  include: typeof oppInclude;
}>;
