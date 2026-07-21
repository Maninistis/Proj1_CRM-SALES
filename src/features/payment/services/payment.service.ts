import { auth } from "@/lib/auth/auth";
import { audit } from "@/lib/audit";
import { notifyBusinessStakeholders } from "@/lib/notify";
import { generateDocumentNo } from "@/lib/document-number";
import { requirePermission } from "@/lib/auth/require-permission";
import { getScopeUserId } from "@/lib/auth/data-scope";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import { syncSalesOrderFromInvoice } from "@/lib/workflow/so-status-sync";
import { prisma } from "@/lib/prisma";
import {
  findMany,
  findById,
  findByIdIncludingDeleted,
  create,
  softDelete,
  restore,
} from "../repositories/payment.repository";

export async function list(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  method?: string;
  deleted?: boolean;
}) {
  const session = await auth();
  requirePermission(session, "payments:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  return findMany({ ...params, scopeUserId, businessId: session!.user.businessId! });
}

export async function getById(id: string) {
  const session = await auth();
  requirePermission(session, "payments:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  const payment = await findById(id, scopeUserId, session!.user.businessId!);
  if (!payment) throw new NotFoundError("Payment", id);
  return payment;
}

export async function create_(input: {
  salesInvoiceId: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  paymentDate: string;
  proofImageUrl?: string;
  notes?: string;
}) {
  const session = await auth();
  requirePermission(session, "payments:create");

  const invoice = await prisma.salesInvoice.findFirst({
    where: { id: input.salesInvoiceId, deletedAt: null },
    include: {
      customer: true,
      payments: { where: { deletedAt: null, status: "RECEIVED" } },
    },
  });
  if (!invoice) throw new NotFoundError("Invoice", input.salesInvoiceId);

  if (!["OPEN", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.status)) {
    throw new ConflictError(`Cannot record payment on invoice with status: ${invoice.status}`);
  }

  const grandTotal = Number(invoice.grandTotal);
  const alreadyPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = grandTotal - alreadyPaid;

  if (input.amount > remaining) {
    throw new ValidationError(
      `Payment of ₱${input.amount.toLocaleString()} exceeds remaining balance of ₱${remaining.toLocaleString()} (Total: ₱${grandTotal.toLocaleString()}, Already paid: ₱${alreadyPaid.toLocaleString()})`
    );
  }

  const customer = invoice.customer;
  if (!customer) throw new NotFoundError("Customer");

  const documentNo = await generateDocumentNo("PAY");

  const payment = await create({
    documentNo,
    salesInvoiceId: input.salesInvoiceId,
    customerId: customer.id,
    customerName: invoice.customerName || customer.name,
    amount: input.amount,
    paymentMethod: input.paymentMethod,
    referenceNumber: input.referenceNumber,
    paymentDate: new Date(input.paymentDate),
    proofImageUrl: input.proofImageUrl || null,
    notes: input.notes,
    receivedById: session!.user.userId,
  businessId: session!.user.businessId!,});

  await recalculateInvoiceBalance(invoice.id);

  await audit({
    entityType: "Payment",
    entityId: payment.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: {
      documentNo: payment.documentNo,
      amount: input.amount,
      method: input.paymentMethod,
      invoice: invoice.documentNo,
      customer: invoice.customerName,
    },
  });

  await notifyBusinessStakeholders({
    actorId: session!.user.userId,
    type: "payment_received",
    title: "Payment Received",
    message: `₱${input.amount.toLocaleString()} received for ${invoice.documentNo} (${invoice.customerName})`,
    entityType: "Payment",
    entityId: payment.id,
    link: `/payments/${payment.id}`,
  });

  return payment;
}

async function recalculateInvoiceBalance(invoiceId: string) {
  const invoice = await prisma.salesInvoice.findUnique({
    where: { id: invoiceId },
    include: {
      payments: { where: { deletedAt: null, status: "RECEIVED" } },
    },
  });
  if (!invoice) return;

  const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const grandTotal = Number(invoice.grandTotal);

  const newInvoiceStatus =
    totalPaid >= grandTotal && grandTotal > 0
      ? "PAID"
      : totalPaid > 0
        ? "PARTIALLY_PAID"
        : invoice.status === "OVERDUE"
          ? "OVERDUE"
          : invoice.status === "VOIDED"
            ? "VOIDED"
            : "OPEN";

  await prisma.salesInvoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount: totalPaid,
      paidAt: totalPaid > 0 ? invoice.payments[0]?.paymentDate : null,
      status: newInvoiceStatus,
    },
  });

  await syncSalesOrderFromInvoice(invoice.salesOrderId);
}

export async function softDelete_(id: string) {
  const session = await auth();
  requirePermission(session, "payments:delete");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Payment", id);

  const invoiceId = existing.salesInvoiceId;
  await softDelete(id);
  await recalculateInvoiceBalance(invoiceId);

  await audit({
    entityType: "Payment",
    entityId: id,
    action: "DELETE",
    userId: session!.user.userId,
    previousState: { documentNo: existing.documentNo, amount: existing.amount.toString() },
  });
}

export async function restore_(id: string) {
  const session = await auth();
  requirePermission(session, "payments:delete");

  const existing = await findByIdIncludingDeleted(id, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Payment", id);
  if (!existing.deletedAt) throw new ConflictError("Payment is not deleted");

  const payment = await restore(id);
  await recalculateInvoiceBalance(existing.salesInvoiceId);

  await audit({
    entityType: "Payment",
    entityId: id,
    action: "UPDATE",
    userId: session!.user.userId,
    previousState: { deletedAt: existing.deletedAt },
    newState: { deletedAt: null },
    metadata: { action: "restore" },
  });

  return payment;
}
