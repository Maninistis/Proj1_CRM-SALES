import { prisma } from "@/lib/prisma";
import { skipTake } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";

const paymentInclude = {
  salesInvoice: { select: { id: true, documentNo: true, grandTotal: true, status: true } },
  customer: { select: { id: true, name: true } },
  receivedBy: { select: { id: true, name: true } },
} satisfies Prisma.PaymentInclude;

export async function findMany(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  method?: string;
  deleted?: boolean;
}) {
  const where: Prisma.PaymentWhereInput = {
    ...(params.deleted ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(params.status && { status: params.status }),
    ...(params.method && { paymentMethod: params.method }),
    ...(params.search && {
      OR: [
        { documentNo: { contains: params.search } },
        { customerName: { contains: params.search } },
        { referenceNumber: { contains: params.search } },
        { salesInvoice: { documentNo: { contains: params.search } } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: paymentInclude,
      ...skipTake({ page: params.page, pageSize: params.pageSize }),
      orderBy: { paymentDate: "desc" },
    }),
    prisma.payment.count({ where }),
  ]);

  return { data, total };
}

export async function findById(id: string) {
  return prisma.payment.findFirst({
    where: { id, deletedAt: null },
    include: paymentInclude,
  });
}

export async function findByIdIncludingDeleted(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: paymentInclude,
  });
}

export async function create(data: {
  documentNo: string;
  salesInvoiceId: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  paymentDate: Date;
  notes?: string;
  receivedById: string;
}) {
  return prisma.payment.create({
    data: {
      documentNo: data.documentNo,
      salesInvoiceId: data.salesInvoiceId,
      customerId: data.customerId,
      customerName: data.customerName,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber || null,
      paymentDate: data.paymentDate,
      notes: data.notes || null,
      receivedById: data.receivedById,
      status: "RECEIVED",
    },
    include: paymentInclude,
  });
}

export async function softDelete(id: string) {
  return prisma.payment.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function restore(id: string) {
  return prisma.payment.update({
    where: { id },
    data: { deletedAt: null },
    include: paymentInclude,
  });
}

export type PaymentWithRelations = Prisma.PaymentGetPayload<{
  include: typeof paymentInclude;
}>;
