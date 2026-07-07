import { prisma } from "@/lib/prisma";
import { skipTake } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";

const leadInclude = {
  assignedTo: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
} satisfies Prisma.LeadInclude;

export async function findMany(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  source?: string;
  deleted?: boolean;
}) {
  const where: Prisma.LeadWhereInput = {
    ...(params.deleted
      ? { deletedAt: { not: null } }
      : { deletedAt: null }),
    ...(params.status && { status: params.status }),
    ...(params.source && { source: params.source }),
    ...(params.search && {
      OR: [
        { firstName: { contains: params.search } },
        { lastName: { contains: params.search } },
        { email: { contains: params.search } },
        { company: { contains: params.search } },
        { documentNo: { contains: params.search } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: leadInclude,
      ...skipTake({ page: params.page, pageSize: params.pageSize }),
      orderBy: { createdAt: "desc" },
    }),
    prisma.lead.count({ where }),
  ]);

  return { data, total };
}

export async function findById(id: string) {
  return prisma.lead.findFirst({
    where: { id, deletedAt: null },
    include: leadInclude,
  });
}

export async function findByIdIncludingDeleted(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: leadInclude,
  });
}

export async function create(data: {
  documentNo: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source: string;
  assignedToId?: string;
  createdById: string;
  notes?: string;
}) {
  return prisma.lead.create({
    data: {
      documentNo: data.documentNo,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || null,
      phone: data.phone || null,
      company: data.company || null,
      jobTitle: data.jobTitle || null,
      source: data.source,
      assignedToId: data.assignedToId || null,
      createdById: data.createdById,
      notes: data.notes || null,
    },
    include: leadInclude,
  });
}

export async function update(
  id: string,
  data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    jobTitle: string;
    source: string;
    assignedToId: string;
    notes: string;
  }>
) {
  return prisma.lead.update({
    where: { id },
    data: {
      ...data,
      email: data.email ?? undefined,
      phone: data.phone ?? undefined,
      company: data.company ?? undefined,
      jobTitle: data.jobTitle ?? undefined,
      assignedToId: data.assignedToId ?? undefined,
      notes: data.notes ?? undefined,
    },
    include: leadInclude,
  });
}

export async function updateStatus(id: string, status: string) {
  return prisma.lead.update({
    where: { id },
    data: { status },
    include: leadInclude,
  });
}

export async function softDelete(id: string) {
  return prisma.lead.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function restore(id: string) {
  return prisma.lead.update({
    where: { id },
    data: { deletedAt: null },
    include: leadInclude,
  });
}

export type LeadWithRelations = Prisma.LeadGetPayload<{ include: typeof leadInclude }>;
