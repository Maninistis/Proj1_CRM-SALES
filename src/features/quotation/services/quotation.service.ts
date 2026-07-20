import { auth } from "@/lib/auth/auth";
import { audit } from "@/lib/audit";
import { notifyBusinessStakeholders } from "@/lib/notify";
import { generateDocumentNo } from "@/lib/document-number";
import { requirePermission } from "@/lib/auth/require-permission";
import { getScopeUserId } from "@/lib/auth/data-scope";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import { isValidTransition } from "../types";
import { computeAllTotals } from "../calculations";
import { prisma } from "@/lib/prisma";
import {
  findMany,
  findById,
  findByIdIncludingDeleted,
  create,
  updateQuotation,
  replaceItems,
  updateStatus,
  softDelete,
  restore,
} from "../repositories/quotation.repository";

async function getTaxRate(): Promise<number> {
  const session = await auth();
  const setting = await prisma.setting.findUnique({
    where: { key_businessId: { key: "tax_rate", businessId: session!.user.businessId ?? "" } },
  });
  return setting ? Number(setting.value) : 0;
}

export async function list(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  deleted?: boolean;
}) {
  const session = await auth();
  requirePermission(session, "quotations:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  return findMany({ ...params, scopeUserId, businessId: session!.user.businessId! });
}

export async function getById(id: string) {
  const session = await auth();
  requirePermission(session, "quotations:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  const quote = await findById(id, scopeUserId, session!.user.businessId!);
  if (!quote) throw new NotFoundError("Quotation", id);
  return quote;
}

export async function create_(input: {
  opportunityId: string;
  subject: string;
  validUntil: string;
  currency?: string;
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
  requirePermission(session, "quotations:create");

  const opp = await prisma.opportunity.findFirst({
    where: { id: input.opportunityId, deletedAt: null },
  });
  if (!opp) throw new NotFoundError("Opportunity", input.opportunityId);
  if (opp.status !== "CLOSED_WON") {
    throw new ConflictError("Opportunity must be CLOSED_WON to create a quotation");
  }

  if (input.items.length === 0) {
    throw new ValidationError("At least one quotation item is required");
  }

  const serverTaxRate = input.taxRate || (await getTaxRate());

  const totals = computeAllTotals(
    input.items,
    input.discountTotal,
    serverTaxRate
  );

  const documentNo = await generateDocumentNo("QUO");

  const quote = await create({
    documentNo,
    opportunityId: input.opportunityId,
    subject: input.subject,
    validUntil: new Date(input.validUntil),
    currency: input.currency || "PHP",
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    taxRate: serverTaxRate,
    taxTotal: totals.taxTotal,
    grandTotal: totals.grandTotal,
    notes: input.notes,
    createdById: session!.user.userId,
    businessId: session!.user.businessId!,items: input.items.map((item, i) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      lineTotal: totals.lineTotals[i],
    })),
  });

  await audit({
    entityType: "Quotation",
    entityId: quote.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: {
      documentNo: quote.documentNo,
      subject: quote.subject,
      grandTotal: quote.grandTotal.toString(),
      itemCount: input.items.length,
    },
  });

  return quote;
}

export async function update_(
  id: string,
  input: {
    subject?: string;
    validUntil?: string;
    discountTotal?: number;
    taxRate?: number;
    notes?: string;
    items?: {
      description: string;
      quantity: number;
      unitPrice: number;
      discountPercent: number;
    }[];
  }
) {
  const session = await auth();
  requirePermission(session, "quotations:update");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Quotation", id);

  if (existing.status !== "DRAFT" && existing.status !== "READY") {
    throw new ConflictError("Cannot edit a quotation that has been sent");
  }

  const items = input.items ?? existing.items.map((i) => ({
    description: i.description,
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
    discountPercent: Number(i.discountPercent),
  }));

  const discountTotal = input.discountTotal ?? Number(existing.discountTotal);
  const taxRate = input.taxRate ?? Number(existing.taxRate);

  const totals = computeAllTotals(items, discountTotal, taxRate);

  const updated = await updateQuotation(id, {
    subject: input.subject,
    validUntil: input.validUntil ? new Date(input.validUntil) : undefined,
    discountTotal: totals.discountTotal,
    taxRate,
    notes: input.notes,
    subtotal: totals.subtotal,
    taxTotal: totals.taxTotal,
    grandTotal: totals.grandTotal,
  });

  if (input.items) {
    await replaceItems(id, items.map((item, i) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      lineTotal: totals.lineTotals[i],
    })));
  }

  await audit({
    entityType: "Quotation",
    entityId: id,
    action: "UPDATE",
    userId: session!.user.userId,
    previousState: {
      subject: existing.subject,
      grandTotal: existing.grandTotal.toString(),
      itemCount: existing.items.length,
    },
    newState: {
      subject: updated?.subject,
      grandTotal: totals.grandTotal,
      itemCount: items.length,
    },
  });

  return await findById(id, undefined, session!.user.businessId!);
}

export async function transition(id: string, to: string) {
  const session = await auth();
  requirePermission(session, "quotations:update");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Quotation", id);

  if (!isValidTransition(existing.status, to)) {
    throw new ConflictError(
      `Cannot transition from ${existing.status} to ${to}`
    );
  }

  if ((to === "READY" || to === "SENT") && existing.items.length === 0) {
    throw new ValidationError("Cannot send a quotation without items");
  }

  const extra: { sentAt?: Date; acceptedAt?: Date } = {};
  if (to === "SENT") extra.sentAt = new Date();
  if (to === "ACCEPTED") extra.acceptedAt = new Date();

  const quote = await updateStatus(id, to, extra);

  await audit({
    entityType: "Quotation",
    entityId: id,
    action: "TRANSITION",
    userId: session!.user.userId,
    previousState: { status: existing.status },
    newState: { status: to },
  });

  if (to === "ACCEPTED") {
    await notifyBusinessStakeholders({
      actorId: session!.user.userId,
      type: "quotation_accepted",
      title: "Quotation Accepted",
      message: `${quote.documentNo} (${existing.subject}) was accepted`,
      entityType: "Quotation",
      entityId: id,
      link: `/quotations/${id}`,
    });
  } else if (to === "REJECTED") {
    await notifyBusinessStakeholders({
      actorId: session!.user.userId,
      type: "quotation_rejected",
      title: "Quotation Rejected",
      message: `${quote.documentNo} (${existing.subject}) was rejected`,
      entityType: "Quotation",
      entityId: id,
      link: `/quotations/${id}`,
    });
  }

  return quote;
}

export async function duplicate(id: string) {
  const session = await auth();
  requirePermission(session, "quotations:create");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Quotation", id);

  const items = existing.items.map((i) => ({
    description: i.description,
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
    discountPercent: Number(i.discountPercent),
  }));

  const totals = computeAllTotals(
    items,
    Number(existing.discountTotal),
    Number(existing.taxRate)
  );

  const documentNo = await generateDocumentNo("QUO");
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 30);

  const quote = await create({
    documentNo,
    opportunityId: existing.opportunityId,
    subject: `${existing.subject} (Copy)`,
    validUntil,
    currency: existing.currency,
    subtotal: totals.subtotal,
    discountTotal: totals.discountTotal,
    taxRate: Number(existing.taxRate),
    taxTotal: totals.taxTotal,
    grandTotal: totals.grandTotal,
    notes: existing.notes ?? undefined,
    createdById: session!.user.userId,
    businessId: session!.user.businessId!,items: items.map((item, i) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent,
      lineTotal: totals.lineTotals[i],
    })),
  });

  await audit({
    entityType: "Quotation",
    entityId: quote.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: {
      documentNo: quote.documentNo,
      subject: quote.subject,
      duplicatedFrom: existing.documentNo,
    },
    metadata: { action: "duplicate", sourceId: id },
  });

  return quote;
}

export async function softDelete_(id: string) {
  const session = await auth();
  requirePermission(session, "quotations:delete");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Quotation", id);

  await softDelete(id);

  await audit({
    entityType: "Quotation",
    entityId: id,
    action: "DELETE",
    userId: session!.user.userId,
    previousState: {
      documentNo: existing.documentNo,
      subject: existing.subject,
      status: existing.status,
    },
  });
}

export async function restore_(id: string) {
  const session = await auth();
  requirePermission(session, "quotations:delete");

  const existing = await findByIdIncludingDeleted(id, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Quotation", id);
  if (!existing.deletedAt) {
    throw new ConflictError("Quotation is not deleted");
  }

  const quote = await restore(id);

  await audit({
    entityType: "Quotation",
    entityId: id,
    action: "UPDATE",
    userId: session!.user.userId,
    previousState: { deletedAt: existing.deletedAt },
    newState: { deletedAt: null },
    metadata: { action: "restore" },
  });

  return quote;
}
