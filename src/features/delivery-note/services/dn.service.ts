import { auth } from "@/lib/auth/auth";
import { audit } from "@/lib/audit";
import { notifyBusinessStakeholders } from "@/lib/notify";
import { generateDocumentNo } from "@/lib/document-number";
import { requirePermission } from "@/lib/auth/require-permission";
import { getScopeUserId } from "@/lib/auth/data-scope";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import { isValidTransition } from "../types";
import { prisma } from "@/lib/prisma";
import { syncSalesOrderFromDelivery } from "@/lib/workflow/so-status-sync";
import { checkPaymentBeforeDelivery } from "@/lib/workflow/delivery-policy";
import {
  findMany,
  findById,
  findByIdIncludingDeleted,
  create,
  updateStatus,
  softDelete,
  restore,
} from "../repositories/dn.repository";

export async function list(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  deleted?: boolean;
}) {
  const session = await auth();
  requirePermission(session, "delivery-notes:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  return findMany({ ...params, scopeUserId, businessId: session!.user.businessId! });
}

export async function getById(id: string) {
  const session = await auth();
  requirePermission(session, "delivery-notes:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  const dn = await findById(id, scopeUserId, session!.user.businessId!);
  if (!dn) throw new NotFoundError("Delivery Note", id);
  return dn;
}

export async function create_(input: {
  salesOrderId: string;
  deliveryDate?: string;
  carrier?: string;
  trackingNumber?: string;
  notes?: string;
  items: {
    salesOrderItemId: string;
    description: string;
    quantity: number;
  }[];
}) {
  const session = await auth();
  requirePermission(session, "delivery-notes:create");

  const so = await prisma.salesOrder.findFirst({
    where: { id: input.salesOrderId, deletedAt: null },
    include: { items: { where: { deletedAt: null } } },
  });
  if (!so) throw new NotFoundError("Sales Order", input.salesOrderId);
  if (!["PARTIALLY_PAID", "FULLY_PAID", "DELIVERED"].includes(so.status)) {
    throw new ConflictError(
      `Sales Order must be PARTIALLY_PAID or FULLY_PAID before delivery (current: ${so.status})`
    );
  }

  const policy = await checkPaymentBeforeDelivery(input.salesOrderId);
  if (!policy.canDeliver) {
    throw new ConflictError(policy.reason ?? "Delivery not allowed by payment policy");
  }

  for (const item of input.items) {
    const soItem = so.items.find((i) => i.id === item.salesOrderItemId);
    if (!soItem) {
      throw new NotFoundError("Sales Order Item", item.salesOrderItemId);
    }
    const orderedQty = Number(soItem.quantity);
    const alreadyDelivered = Number(soItem.deliveredQuantity);
    const remaining = orderedQty - alreadyDelivered;
    if (item.quantity > remaining) {
      throw new ValidationError(
        `Cannot deliver ${item.quantity} of "${soItem.description}". Only ${remaining} remaining (ordered: ${orderedQty}, already delivered: ${alreadyDelivered}).`
      );
    }
  }

  const documentNo = await generateDocumentNo("DN");

  const dn = await create({
    documentNo,
    salesOrderId: input.salesOrderId,
    deliveryDate: input.deliveryDate ? new Date(input.deliveryDate) : undefined,
    carrier: input.carrier,
    trackingNumber: input.trackingNumber,
    notes: input.notes,
    createdById: session!.user.userId,
    businessId: session!.user.businessId!,items: input.items,
  });

  await updateDeliveredQuantities(input.salesOrderId, session!.user.businessId!);
  await syncSalesOrderFromDelivery(input.salesOrderId);

  await audit({
    entityType: "DeliveryNote",
    entityId: dn.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: { documentNo: dn.documentNo, salesOrder: so.documentNo, itemCount: input.items.length },
  });

  return dn;
}

async function updateDeliveredQuantities(salesOrderId: string, businessId: string) {
  const allDNs = await prisma.deliveryNote.findMany({
    where: { businessId, salesOrderId, deletedAt: null, status: { not: "CANCELLED" } },
    include: { items: { where: { deletedAt: null } } },
  });

  const itemQtyMap = new Map<string, number>();

  for (const dn of allDNs) {
    for (const item of dn.items) {
      const current = itemQtyMap.get(item.salesOrderItemId) || 0;
      itemQtyMap.set(item.salesOrderItemId, current + Number(item.quantity));
    }
  }

  for (const [itemId, totalDelivered] of itemQtyMap) {
    await prisma.salesOrderItem.update({
      where: { id: itemId },
      data: { deliveredQuantity: totalDelivered },
    });
  }
}

async function checkAndAutoTransitionSO(salesOrderId: string) {
  await syncSalesOrderFromDelivery(salesOrderId);
}

export async function transition(id: string, to: string) {
  const session = await auth();
  requirePermission(session, "delivery-notes:update");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Delivery Note", id);

  if (!isValidTransition(existing.status, to)) {
    throw new ConflictError(`Cannot transition from ${existing.status} to ${to}`);
  }

  const extra: { deliveryDate?: Date } = {};
  if (to === "DELIVERED" && !existing.deliveryDate) {
    extra.deliveryDate = new Date();
  }

  const dn = await updateStatus(id, to, extra);

  await audit({
    entityType: "DeliveryNote",
    entityId: id,
    action: "TRANSITION",
    userId: session!.user.userId,
    previousState: { status: existing.status },
    newState: { status: to },
  });

  await syncSalesOrderFromDelivery(existing.salesOrderId);

  if (to === "DELIVERED") {
    await notifyBusinessStakeholders({
      actorId: session!.user.userId,
      type: "delivery_completed",
      title: "Delivery Completed",
      message: `Delivery ${dn.documentNo} was completed`,
      entityType: "DeliveryNote",
      entityId: id,
      link: `/delivery-notes/${id}`,
    });
  }

  return dn;
}

export async function softDelete_(id: string) {
  const session = await auth();
  requirePermission(session, "delivery-notes:delete");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Delivery Note", id);

  await softDelete(id);

  await updateDeliveredQuantities(existing.salesOrderId, session!.user.businessId!);
  await syncSalesOrderFromDelivery(existing.salesOrderId);

  await audit({
    entityType: "DeliveryNote",
    entityId: id,
    action: "DELETE",
    userId: session!.user.userId,
    previousState: { documentNo: existing.documentNo, status: existing.status },
  });
}

export async function restore_(id: string) {
  const session = await auth();
  requirePermission(session, "delivery-notes:delete");

  const existing = await findByIdIncludingDeleted(id, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Delivery Note", id);
  if (!existing.deletedAt) throw new ConflictError("Delivery Note is not deleted");

  const dn = await restore(id);

  await updateDeliveredQuantities(existing.salesOrderId, session!.user.businessId!);
  await syncSalesOrderFromDelivery(existing.salesOrderId);

  await audit({
    entityType: "DeliveryNote",
    entityId: id,
    action: "UPDATE",
    userId: session!.user.userId,
    previousState: { deletedAt: existing.deletedAt },
    newState: { deletedAt: null },
    metadata: { action: "restore" },
  });

  return dn;
}
