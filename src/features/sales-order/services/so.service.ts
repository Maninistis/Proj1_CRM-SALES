import { auth } from "@/lib/auth/auth";
import { audit } from "@/lib/audit";
import { generateDocumentNo } from "@/lib/document-number";
import { requirePermission } from "@/lib/auth/require-permission";
import { getScopeUserId } from "@/lib/auth/data-scope";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import { computeAllTotals } from "@/features/quotation/calculations";
import { isValidTransition } from "../types";
import { prisma } from "@/lib/prisma";
import {
  findMany,
  findById,
  findByIdIncludingDeleted,
  findByQuotationId,
  create,
  updateStatus,
  softDelete,
  restore,
} from "../repositories/so.repository";

export async function list(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  deleted?: boolean;
}) {
  const session = await auth();
  requirePermission(session, "sales-orders:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  return findMany({ ...params, scopeUserId });
}

export async function getById(id: string) {
  const session = await auth();
  requirePermission(session, "sales-orders:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  const so = await findById(id, scopeUserId);
  if (!so) throw new NotFoundError("Sales Order", id);
  return so;
}

export async function create_(input: {
  customerId: string;
  quotationId?: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  discountTotal: number;
  taxRate: number;
  notes?: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
  }[];
}) {
  const session = await auth();
  requirePermission(session, "sales-orders:create");

  const customer = await prisma.customer.findFirst({
    where: { id: input.customerId, deletedAt: null },
  });
  if (!customer) throw new NotFoundError("Customer", input.customerId);
  if (customer.status !== "ACTIVE") {
    throw new ConflictError("Customer must be ACTIVE to create a sales order");
  }

  if (input.quotationId) {
    const quote = await prisma.quotation.findFirst({
      where: { id: input.quotationId, deletedAt: null },
    });
    if (!quote) throw new NotFoundError("Quotation", input.quotationId);
    if (quote.status !== "ACCEPTED") {
      throw new ConflictError("Quotation must be ACCEPTED to convert");
    }
    const existing = await findByQuotationId(input.quotationId);
    if (existing) {
      throw new ConflictError("This quotation already has a sales order");
    }
  }

  if (input.items.length === 0) {
    throw new ValidationError("At least one item is required");
  }

  const totals = computeAllTotals(input.items, input.discountTotal, input.taxRate);
  const documentNo = await generateDocumentNo("SO");

  const so = await create({
    documentNo,
    customerId: input.customerId,
    quotationId: input.quotationId || undefined,
    orderDate: new Date(input.orderDate),
    expectedDeliveryDate: input.expectedDeliveryDate ? new Date(input.expectedDeliveryDate) : undefined,
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    taxRate: input.taxRate,
    taxTotal: totals.taxTotal,
    grandTotal: totals.grandTotal,
    notes: input.notes,
    createdById: session!.user.userId,
    items: input.items.map((item, i) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      lineTotal: totals.lineTotals[i],
    })),
  });

  await audit({
    entityType: "SalesOrder",
    entityId: so.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: {
      documentNo: so.documentNo,
      customer: customer.name,
      grandTotal: totals.grandTotal,
      fromQuotation: input.quotationId ? "yes" : "no",
    },
  });

  return so;
}

export async function convertFromQuotation(
  quotationId: string,
  customerId: string
) {
  const session = await auth();
  requirePermission(session, "sales-orders:create");

  const quote = await prisma.quotation.findFirst({
    where: { id: quotationId, deletedAt: null },
    include: { items: { where: { deletedAt: null } } },
  });
  if (!quote) throw new NotFoundError("Quotation", quotationId);
  if (quote.status !== "ACCEPTED") {
    throw new ConflictError("Quotation must be ACCEPTED to convert");
  }

  const existing = await findByQuotationId(quotationId);
  if (existing) {
    throw new ConflictError("This quotation already has a sales order");
  }

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, deletedAt: null },
  });
  if (!customer) throw new NotFoundError("Customer", customerId);
  if (customer.status !== "ACTIVE") {
    throw new ConflictError("Customer must be ACTIVE");
  }

  const items = quote.items.map((i) => ({
    description: i.description,
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
    discountPercent: Number(i.discountPercent),
  }));

  const totals = computeAllTotals(items, Number(quote.discountTotal), Number(quote.taxRate));
  const documentNo = await generateDocumentNo("SO");

  const so = await create({
    documentNo,
    customerId,
    quotationId,
    orderDate: new Date(),
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    taxRate: Number(quote.taxRate),
    taxTotal: totals.taxTotal,
    grandTotal: totals.grandTotal,
    notes: quote.notes ?? undefined,
    createdById: session!.user.userId,
    items: items.map((item, i) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      lineTotal: totals.lineTotals[i],
    })),
  });

  await audit({
    entityType: "SalesOrder",
    entityId: so.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: {
      documentNo: so.documentNo,
      customer: customer.name,
      grandTotal: totals.grandTotal,
      convertedFrom: quote.documentNo,
    },
    metadata: { action: "quotation_conversion", quotationId },
  });

  return so;
}

export async function transition(id: string, to: string) {
  const session = await auth();
  requirePermission(session, "sales-orders:update");

  const existing = await findById(id);
  if (!existing) throw new NotFoundError("Sales Order", id);

  if (!isValidTransition(existing.status, to)) {
    throw new ConflictError(`Cannot transition from ${existing.status} to ${to}`);
  }

  if (to === "CANCELLED") {
    if (existing.status === "FULFILLING") {
      throw new ConflictError("Cannot cancel an order that is being fulfilled");
    }
  }

  const so = await updateStatus(id, to);

  await audit({
    entityType: "SalesOrder",
    entityId: id,
    action: "TRANSITION",
    userId: session!.user.userId,
    previousState: { status: existing.status },
    newState: { status: to },
  });

  return so;
}

export async function softDelete_(id: string) {
  const session = await auth();
  requirePermission(session, "sales-orders:delete");

  const existing = await findById(id);
  if (!existing) throw new NotFoundError("Sales Order", id);

  await softDelete(id);

  await audit({
    entityType: "SalesOrder",
    entityId: id,
    action: "DELETE",
    userId: session!.user.userId,
    previousState: { documentNo: existing.documentNo, status: existing.status },
  });
}

export async function restore_(id: string) {
  const session = await auth();
  requirePermission(session, "sales-orders:delete");

  const existing = await findByIdIncludingDeleted(id);
  if (!existing) throw new NotFoundError("Sales Order", id);
  if (!existing.deletedAt) throw new ConflictError("Sales Order is not deleted");

  const so = await restore(id);

  await audit({
    entityType: "SalesOrder",
    entityId: id,
    action: "UPDATE",
    userId: session!.user.userId,
    previousState: { deletedAt: existing.deletedAt },
    newState: { deletedAt: null },
    metadata: { action: "restore" },
  });

  return so;
}
