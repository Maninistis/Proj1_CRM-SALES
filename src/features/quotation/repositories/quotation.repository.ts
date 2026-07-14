import { prisma } from "@/lib/prisma";
import { skipTake } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";

const quoteInclude = {
  opportunity: {
    select: { id: true, title: true, documentNo: true, leadId: true },
  },
  createdBy: { select: { id: true, name: true } },
  items: {
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.QuotationInclude;

export async function findMany(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  deleted?: boolean;
}) {
  const where: Prisma.QuotationWhereInput = {
    ...(params.deleted
      ? { deletedAt: { not: null } }
      : { deletedAt: null }),
    ...(params.status && { status: params.status }),
    ...(params.search && {
      OR: [
        { documentNo: { contains: params.search } },
        { subject: { contains: params.search } },
        { opportunity: { title: { contains: params.search } } },
        { opportunity: { lead: { firstName: { contains: params.search } } } },
        { opportunity: { lead: { lastName: { contains: params.search } } } },
        { opportunity: { lead: { company: { contains: params.search } } } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      include: quoteInclude,
      ...skipTake({ page: params.page, pageSize: params.pageSize }),
      orderBy: { createdAt: "desc" },
    }),
    prisma.quotation.count({ where }),
  ]);

  return { data, total };
}

export async function findById(id: string) {
  return prisma.quotation.findFirst({
    where: { id, deletedAt: null },
    include: quoteInclude,
  });
}

export async function findByIdIncludingDeleted(id: string) {
  return prisma.quotation.findUnique({
    where: { id },
    include: quoteInclude,
  });
}

export async function create(data: {
  documentNo: string;
  opportunityId: string;
  subject: string;
  validUntil: Date;
  currency: string;
  subtotal: number;
  discountTotal: number;
  taxRate: number;
  taxTotal: number;
  grandTotal: number;
  notes?: string;
  createdById: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    lineTotal: number;
  }[];
}) {
  return prisma.quotation.create({
    data: {
      documentNo: data.documentNo,
      opportunityId: data.opportunityId,
      subject: data.subject,
      validUntil: data.validUntil,
      currency: data.currency,
      subtotal: data.subtotal,
      discountTotal: data.discountTotal,
      taxRate: data.taxRate,
      taxTotal: data.taxTotal,
      grandTotal: data.grandTotal,
      notes: data.notes || null,
      createdById: data.createdById,
      items: {
        create: data.items,
      },
    },
    include: quoteInclude,
  });
}

export async function updateQuotation(
  id: string,
  data: {
    subject?: string;
    validUntil?: Date;
    discountTotal?: number;
    taxRate?: number;
    notes?: string;
    subtotal?: number;
    taxTotal?: number;
    grandTotal?: number;
  }
) {
  return prisma.quotation.update({
    where: { id },
    data: {
      ...data,
      notes: data.notes ?? undefined,
    },
    include: quoteInclude,
  });
}

export async function replaceItems(
  quotationId: string,
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    lineTotal: number;
  }[]
) {
  await prisma.quotationItem.deleteMany({
    where: { quotationId },
  });

  if (items.length > 0) {
    await prisma.quotationItem.createMany({
      data: items.map((item) => ({ ...item, quotationId })),
    });
  }

  return prisma.quotation.findUnique({
    where: { id: quotationId },
    include: quoteInclude,
  });
}

export async function updateStatus(
  id: string,
  status: string,
  extra?: { sentAt?: Date; acceptedAt?: Date }
) {
  return prisma.quotation.update({
    where: { id },
    data: { status, ...extra },
    include: quoteInclude,
  });
}

export async function softDelete(id: string) {
  await prisma.quotationItem.updateMany({
    where: { quotationId: id },
    data: { deletedAt: new Date() },
  });
  return prisma.quotation.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function restore(id: string) {
  await prisma.quotationItem.updateMany({
    where: { quotationId: id },
    data: { deletedAt: null },
  });
  return prisma.quotation.update({
    where: { id },
    data: { deletedAt: null },
    include: quoteInclude,
  });
}

export type QuotationWithRelations = Prisma.QuotationGetPayload<{
  include: typeof quoteInclude;
}>;
