import { prisma } from "@/lib/prisma";
import { skipTake } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";

const soInclude = {
  customer: { select: { id: true, name: true, documentNo: true } },
  quotation: { select: { id: true, documentNo: true, subject: true } },
  createdBy: { select: { id: true, name: true } },
  items: { where: { deletedAt: null }, orderBy: { createdAt: "asc" } },
  invoice: { where: { deletedAt: null }, select: { id: true, documentNo: true, status: true } },
} satisfies Prisma.SalesOrderInclude;

export async function findMany(params: {
  businessId: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  deleted?: boolean;
  scopeUserId?: string;
}) {
  const where: Prisma.SalesOrderWhereInput = {
    businessId: params.businessId,
    ...(params.scopeUserId && { createdById: params.scopeUserId }),
    ...(params.deleted ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(params.status && { status: params.status }),
    ...(params.search && {
      OR: [
        { documentNo: { contains: params.search } },
        { customer: { name: { contains: params.search } } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where,
      include: soInclude,
      ...skipTake({ page: params.page, pageSize: params.pageSize }),
      orderBy: { createdAt: "desc" },
    }),
    prisma.salesOrder.count({ where }),
  ]);

  return { data, total };
}

export async function findById(id: string, scopeUserId?: string, businessId?: string) {
  return prisma.salesOrder.findFirst({
    where: {
      id,
      ...(businessId && { businessId }),
      deletedAt: null,
      ...(scopeUserId && { createdById: scopeUserId }),
    },
    include: soInclude,
  });
}

export async function findByIdIncludingDeleted(id: string, businessId?: string) {
  return prisma.salesOrder.findUnique({
    where: { id },
    include: soInclude,
  });
}

export async function findByQuotationId(quotationId: string) {
  return prisma.salesOrder.findFirst({
    where: { quotationId },
  });
}

export async function create(data: {
  businessId: string;
  documentNo: string;
  customerId: string;
  quotationId?: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
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
  return prisma.salesOrder.create({
    data: {
      businessId: data.businessId,
      documentNo: data.documentNo,
      customerId: data.customerId,
      quotationId: data.quotationId || null,
      orderDate: data.orderDate,
      expectedDeliveryDate: data.expectedDeliveryDate || null,
      subtotal: data.subtotal,
      discountTotal: data.discountTotal,
      taxRate: data.taxRate,
      taxTotal: data.taxTotal,
      grandTotal: data.grandTotal,
      notes: data.notes || null,
      createdById: data.createdById,
      status: "AWAITING_PAYMENT",
      items: { create: data.items },
    },
    include: soInclude,
  });
}

export async function updateStatus(id: string, status: string) {
  return prisma.salesOrder.update({
    where: { id },
    data: { status },
    include: soInclude,
  });
}

export async function softDelete(id: string) {
  await prisma.salesOrderItem.updateMany({
    where: { salesOrderId: id },
    data: { deletedAt: new Date() },
  });
  return prisma.salesOrder.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function restore(id: string) {
  await prisma.salesOrderItem.updateMany({
    where: { salesOrderId: id },
    data: { deletedAt: null },
  });
  return prisma.salesOrder.update({
    where: { id },
    data: { deletedAt: null },
    include: soInclude,
  });
}

export type SalesOrderWithRelations = Prisma.SalesOrderGetPayload<{
  include: typeof soInclude;
}>;
