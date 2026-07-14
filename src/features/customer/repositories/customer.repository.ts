import { prisma } from "@/lib/prisma";
import { skipTake } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";

const customerInclude = {
  createdBy: { select: { id: true, name: true } },
  contacts: { where: { deletedAt: null }, orderBy: { isPrimary: "desc" } },
  addresses: { where: { deletedAt: null } },
  _count: { select: { addresses: true, contacts: true } },
} satisfies Prisma.CustomerInclude;

export async function findMany(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  deleted?: boolean;
}) {
  const where: Prisma.CustomerWhereInput = {
    ...(params.deleted ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(params.status && { status: params.status }),
    ...(params.search && {
      OR: [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { phone: { contains: params.search } },
        { documentNo: { contains: params.search } },
        { taxId: { contains: params.search } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: customerInclude,
      ...skipTake({ page: params.page, pageSize: params.pageSize }),
      orderBy: { createdAt: "desc" },
    }),
    prisma.customer.count({ where }),
  ]);

  return { data, total };
}

export async function findById(id: string) {
  return prisma.customer.findFirst({
    where: { id, deletedAt: null },
    include: customerInclude,
  });
}

export async function findByIdIncludingDeleted(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: customerInclude,
  });
}

export async function findByEmail(email: string) {
  return prisma.customer.findFirst({
    where: { email, deletedAt: null },
  });
}

export async function create(data: {
  documentNo: string;
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  website?: string;
  creditLimit?: number;
  paymentTerms: number;
  leadId?: string;
  createdById: string;
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country: string;
  };
}) {
  return prisma.customer.create({
    data: {
      documentNo: data.documentNo,
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      taxId: data.taxId || null,
      website: data.website || null,
      creditLimit: data.creditLimit || null,
      paymentTerms: data.paymentTerms,
      leadId: data.leadId || null,
      createdById: data.createdById,
      status: "ACTIVE",
      addresses: data.billingAddress?.line1
        ? {
            create: {
              type: "BILLING",
              line1: data.billingAddress.line1,
              line2: data.billingAddress.line2 || null,
              city: data.billingAddress.city,
              state: data.billingAddress.state || null,
              postalCode: data.billingAddress.postalCode || null,
              country: data.billingAddress.country,
            },
          }
        : undefined,
    },
    include: customerInclude,
  });
}

export async function update(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    taxId: string;
    website: string;
    creditLimit: number;
    paymentTerms: number;
  }>
) {
  return prisma.customer.update({
    where: { id },
    data: {
      ...data,
      email: data.email ?? undefined,
      phone: data.phone ?? undefined,
      taxId: data.taxId ?? undefined,
      website: data.website ?? undefined,
      creditLimit: data.creditLimit ?? undefined,
    },
    include: customerInclude,
  });
}

export async function updateStatus(id: string, status: string) {
  return prisma.customer.update({
    where: { id },
    data: { status },
    include: customerInclude,
  });
}

export async function softDelete(id: string) {
  return prisma.customer.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function restore(id: string) {
  return prisma.customer.update({
    where: { id },
    data: { deletedAt: null },
    include: customerInclude,
  });
}

export type CustomerWithRelations = Prisma.CustomerGetPayload<{
  include: typeof customerInclude;
}>;
