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
  findBySalesOrderId,
  create,
  updateStatus,
  updatePaidAmount,
  softDelete,
  restore,
} from "../repositories/invoice.repository";

export async function list(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  deleted?: boolean;
}) {
  const session = await auth();
  requirePermission(session, "sales-invoices:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  return findMany({ ...params, scopeUserId });
}

export async function getById(id: string) {
  const session = await auth();
  requirePermission(session, "sales-invoices:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  const inv = await findById(id, scopeUserId);
  if (!inv) throw new NotFoundError("Invoice", id);
  return inv;
}

export async function create_(input: {
  salesOrderId: string;
  issueDate: string;
  dueDate: string;
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
  requirePermission(session, "sales-invoices:create");

  const so = await prisma.salesOrder.findFirst({
    where: { id: input.salesOrderId, deletedAt: null },
    include: { customer: { include: { addresses: { where: { deletedAt: null, type: "BILLING" } } } } },
  });
  if (!so) throw new NotFoundError("Sales Order", input.salesOrderId);

  if (!["CONFIRMED", "FULFILLING", "DELIVERED", "INVOICED"].includes(so.status)) {
    throw new ConflictError("Sales Order must be CONFIRMED to create an invoice");
  }

  const existing = await findBySalesOrderId(input.salesOrderId);
  if (existing) {
    throw new ConflictError("This sales order already has an invoice");
  }

  if (input.items.length === 0) {
    throw new ValidationError("At least one item is required");
  }

  const totals = computeAllTotals(input.items, input.discountTotal, input.taxRate);
  const documentNo = await generateDocumentNo("INV");

  const customer = so.customer;
  if (!customer) throw new NotFoundError("Customer");
  const billing = customer.addresses[0];
  const addressStr = billing
    ? [billing.line1, billing.line2, billing.city, billing.state, billing.postalCode, billing.country].filter(Boolean).join(", ")
    : undefined;

  const invoice = await create({
    documentNo,
    salesOrderId: input.salesOrderId,
    customerId: customer.id,
    customerName: customer.name,
    customerEmail: customer.email ?? undefined,
    customerPhone: customer.phone ?? undefined,
    customerAddress: addressStr,
    issueDate: new Date(input.issueDate),
    dueDate: new Date(input.dueDate),
    currency: "PHP",
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

  await prisma.salesOrder.update({
    where: { id: input.salesOrderId },
    data: { status: "INVOICED" },
  });

  await audit({
    entityType: "Invoice",
    entityId: invoice.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: {
      documentNo: invoice.documentNo,
      customer: customer.name,
      grandTotal: totals.grandTotal,
      fromSO: so.documentNo,
    },
  });

  return invoice;
}

export async function generateFromSalesOrder(salesOrderId: string) {
  const session = await auth();
  requirePermission(session, "sales-invoices:create");

  const so = await prisma.salesOrder.findFirst({
    where: { id: salesOrderId, deletedAt: null },
    include: {
      customer: { include: { addresses: { where: { deletedAt: null, type: "BILLING" } } } },
      items: { where: { deletedAt: null } },
    },
  });
  if (!so) throw new NotFoundError("Sales Order", salesOrderId);

  if (!["CONFIRMED", "FULFILLING", "DELIVERED", "INVOICED"].includes(so.status)) {
    throw new ConflictError("Sales Order must be CONFIRMED to create an invoice");
  }

  const existing = await findBySalesOrderId(salesOrderId);
  if (existing) {
    throw new ConflictError("This sales order already has an invoice");
  }

  const items = so.items.map((i) => ({
    description: i.description,
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
    discountPercent: Number(i.discountPercent),
  }));

  const totals = computeAllTotals(items, Number(so.discountTotal), Number(so.taxRate));
  const documentNo = await generateDocumentNo("INV");

  const customer = so.customer;
  const billing = customer?.addresses[0];
  const addressStr = billing
    ? [billing.line1, billing.line2, billing.city, billing.state, billing.postalCode, billing.country].filter(Boolean).join(", ")
    : undefined;

  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (customer?.paymentTerms || 30));

  const invoice = await create({
    documentNo,
    salesOrderId,
    customerId: so.customerId,
    customerName: customer?.name ?? "Unknown",
    customerEmail: customer?.email ?? undefined,
    customerPhone: customer?.phone ?? undefined,
    customerAddress: addressStr,
    issueDate,
    dueDate,
    currency: "PHP",
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    taxRate: Number(so.taxRate),
    taxTotal: totals.taxTotal,
    grandTotal: totals.grandTotal,
    notes: so.notes ?? undefined,
    createdById: session!.user.userId,
    items: items.map((item, i) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      lineTotal: totals.lineTotals[i],
    })),
  });

  await prisma.salesOrder.update({
    where: { id: salesOrderId },
    data: { status: "INVOICED" },
  });

  await audit({
    entityType: "Invoice",
    entityId: invoice.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: {
      documentNo: invoice.documentNo,
      customer: so.customer?.name,
      grandTotal: totals.grandTotal,
      generatedFrom: so.documentNo,
    },
    metadata: { action: "so_generation", salesOrderId },
  });

  return invoice;
}

export async function transition(id: string, to: string) {
  const session = await auth();
  requirePermission(session, "sales-invoices:update");

  const existing = await findById(id);
  if (!existing) throw new NotFoundError("Invoice", id);

  if (!isValidTransition(existing.status, to)) {
    throw new ConflictError(`Cannot transition from ${existing.status} to ${to}`);
  }

  const inv = await updateStatus(id, to);

  await audit({
    entityType: "Invoice",
    entityId: id,
    action: "TRANSITION",
    userId: session!.user.userId,
    previousState: { status: existing.status },
    newState: { status: to },
  });

  return inv;
}

export async function softDelete_(id: string) {
  const session = await auth();
  requirePermission(session, "sales-invoices:delete");

  const existing = await findById(id);
  if (!existing) throw new NotFoundError("Invoice", id);

  await softDelete(id);

  await audit({
    entityType: "Invoice",
    entityId: id,
    action: "DELETE",
    userId: session!.user.userId,
    previousState: { documentNo: existing.documentNo, status: existing.status },
  });
}

export async function restore_(id: string) {
  const session = await auth();
  requirePermission(session, "sales-invoices:delete");

  const existing = await findByIdIncludingDeleted(id);
  if (!existing) throw new NotFoundError("Invoice", id);
  if (!existing.deletedAt) throw new ConflictError("Invoice is not deleted");

  const inv = await restore(id);

  await audit({
    entityType: "Invoice",
    entityId: id,
    action: "UPDATE",
    userId: session!.user.userId,
    previousState: { deletedAt: existing.deletedAt },
    newState: { deletedAt: null },
    metadata: { action: "restore" },
  });

  return inv;
}
