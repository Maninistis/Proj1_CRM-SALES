import { prisma } from "@/lib/prisma";
import { skipTake } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";

const dnInclude = {
  salesOrder: {
    select: { id: true, documentNo: true, customer: { select: { id: true, name: true } } },
  },
  createdBy: { select: { id: true, name: true } },
  items: {
    where: { deletedAt: null },
    include: { salesOrderItem: { select: { id: true, quantity: true, deliveredQuantity: true } } },
  },
} satisfies Prisma.DeliveryNoteInclude;

export async function findMany(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  deleted?: boolean;
  scopeUserId?: string;
}) {
  const where: Prisma.DeliveryNoteWhereInput = {
    ...(params.scopeUserId && { createdById: params.scopeUserId }),
    ...(params.deleted ? { deletedAt: { not: null } } : { deletedAt: null }),
    ...(params.status && { status: params.status }),
    ...(params.search && {
      OR: [
        { documentNo: { contains: params.search } },
        { salesOrder: { documentNo: { contains: params.search } } },
        { salesOrder: { customer: { name: { contains: params.search } } } },
        { trackingNumber: { contains: params.search } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.deliveryNote.findMany({
      where,
      include: dnInclude,
      ...skipTake({ page: params.page, pageSize: params.pageSize }),
      orderBy: { createdAt: "desc" },
    }),
    prisma.deliveryNote.count({ where }),
  ]);

  return { data, total };
}

export async function findById(id: string, scopeUserId?: string) {
  return prisma.deliveryNote.findFirst({
    where: {
      id,
      deletedAt: null,
      ...(scopeUserId && { createdById: scopeUserId }),
    },
    include: dnInclude,
  });
}

export async function findByIdIncludingDeleted(id: string) {
  return prisma.deliveryNote.findUnique({
    where: { id },
    include: dnInclude,
  });
}

export async function create(data: {
  documentNo: string;
  salesOrderId: string;
  deliveryDate?: Date;
  carrier?: string;
  trackingNumber?: string;
  notes?: string;
  createdById: string;
  items: {
    salesOrderItemId: string;
    description: string;
    quantity: number;
  }[];
}) {
  return prisma.deliveryNote.create({
    data: {
      documentNo: data.documentNo,
      salesOrderId: data.salesOrderId,
      deliveryDate: data.deliveryDate || null,
      carrier: data.carrier || null,
      trackingNumber: data.trackingNumber || null,
      notes: data.notes || null,
      createdById: data.createdById,
      status: "DRAFT",
      items: { create: data.items },
    },
    include: dnInclude,
  });
}

export async function updateStatus(id: string, status: string, extra?: { deliveryDate?: Date }) {
  return prisma.deliveryNote.update({
    where: { id },
    data: { status, ...extra },
    include: dnInclude,
  });
}

export async function softDelete(id: string) {
  await prisma.deliveryNoteItem.updateMany({
    where: { deliveryNoteId: id },
    data: { deletedAt: new Date() },
  });
  return prisma.deliveryNote.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function restore(id: string) {
  await prisma.deliveryNoteItem.updateMany({
    where: { deliveryNoteId: id },
    data: { deletedAt: null },
  });
  return prisma.deliveryNote.update({
    where: { id },
    data: { deletedAt: null },
    include: dnInclude,
  });
}

export type DeliveryNoteWithRelations = Prisma.DeliveryNoteGetPayload<{
  include: typeof dnInclude;
}>;
