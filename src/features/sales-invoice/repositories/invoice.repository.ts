import { prisma } from "@/lib/prisma";
import { skipTake } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";

const invInclude = {
  customer: { select: { id: true, name: true, documentNo: true } },
  salesOrder: { select: { id: true, documentNo: true } },
  createdBy: { select: { id: true, name: true } },
  items: { where: { deletedAt: null }, orderBy: { createdAt: "asc" } },
} satisfies Prisma.SalesInvoiceInclude;

export async function findMany(params: {
  businessId: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  deleted?: boolean;
  scopeUserId?: string;
}) {
  const where: Prisma.SalesInvoiceWhereInput = {
    businessId: params.businessId,
    ...(params.scopeUserId && { createdById: params.scopeUserId }),
    ...(params.deleted ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(params.status && { status: params.status }),
    ...(params.search && {
      OR: [
        { documentNo: { contains: params.search } },
        { customer: { name: { contains: params.search } } },
        { salesOrder: { documentNo: { contains: params.search } } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.salesInvoice.findMany({
      where,
      include: invInclude,
      ...skipTake({ page: params.page, pageSize: params.pageSize }),
      orderBy: { createdAt: "desc" },
    }),
    prisma.salesInvoice.count({ where }),
  ]);

  return { data, total };
}

export async function findById(id: string, scopeUserId?: string, businessId?: string) {
  return prisma.salesInvoice.findFirst({
    where: {
      id,
      ...(businessId && { businessId }),
      deletedAt: null,
      ...(scopeUserId && { createdById: scopeUserId }),
    },
    include: invInclude,
  });
}

export async function findByIdIncludingDeleted(id: string, businessId?: string) {
  return prisma.salesInvoice.findUnique({
    where: { id },
    include: invInclude,
  });
}

export async function findBySalesOrderId(salesOrderId: string) {
  return prisma.salesInvoice.findFirst({
    where: { salesOrderId },
  });
}

export async function create(data: {
  businessId: string;
  documentNo: string;
  salesOrderId: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  issueDate: Date;
  dueDate: Date;
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
  return prisma.salesInvoice.create({
    data: {
      businessId: data.businessId,
      documentNo: data.documentNo,
      salesOrderId: data.salesOrderId,
      customerId: data.customerId,
      customerName: data.customerName,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone || null,
      customerAddress: data.customerAddress || null,
      status: "OPEN",
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      currency: data.currency,
      subtotal: data.subtotal,
      discountTotal: data.discountTotal,
      taxRate: data.taxRate,
      taxTotal: data.taxTotal,
      grandTotal: data.grandTotal,
      notes: data.notes || null,
      createdById: data.createdById,
      items: { create: data.items },
    },
    include: invInclude,
  });
}

export async function updateStatus(id: string, status: string) {
  return prisma.salesInvoice.update({
    where: { id },
    data: { status },
    include: invInclude,
  });
}

export async function updatePaidAmount(id: string, paidAmount: number) {
  return prisma.salesInvoice.update({
    where: { id },
    data: { paidAmount },
    include: invInclude,
  });
}

export async function softDelete(id: string) {
  await prisma.salesInvoiceItem.updateMany({
    where: { salesInvoiceId: id },
    data: { deletedAt: new Date() },
  });
  return prisma.salesInvoice.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function restore(id: string) {
  await prisma.salesInvoiceItem.updateMany({
    where: { salesInvoiceId: id },
    data: { deletedAt: null },
  });
  return prisma.salesInvoice.update({
    where: { id },
    data: { deletedAt: null },
    include: invInclude,
  });
}

export type InvoiceWithRelations = Prisma.SalesInvoiceGetPayload<{
  include: typeof invInclude;
}>;
