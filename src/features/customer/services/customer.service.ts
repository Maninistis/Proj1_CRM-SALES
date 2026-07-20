import { auth } from "@/lib/auth/auth";
import { audit } from "@/lib/audit";
import { notifyBusinessStakeholders } from "@/lib/notify";
import { generateDocumentNo } from "@/lib/document-number";
import { requirePermission } from "@/lib/auth/require-permission";
import { getScopeUserId } from "@/lib/auth/data-scope";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { isValidTransition } from "../types";
import { prisma } from "@/lib/prisma";
import {
  findMany,
  findById,
  findByIdIncludingDeleted,
  findByEmail,
  create,
  update,
  updateStatus,
  softDelete,
  restore,
} from "../repositories/customer.repository";

export async function list(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  deleted?: boolean;
}) {
  const session = await auth();
  requirePermission(session, "customers:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  return findMany({ ...params, scopeUserId, businessId: session!.user.businessId! });
}

export async function getById(id: string) {
  const session = await auth();
  requirePermission(session, "customers:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  const customer = await findById(id, scopeUserId, session!.user.businessId!);
  if (!customer) throw new NotFoundError("Customer", id);
  return customer;
}

export async function create_(input: {
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  website?: string;
  creditLimit?: number;
  paymentTerms: number;
  leadId?: string;
  billingLine1?: string;
  billingLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalCode?: string;
  billingCountry?: string;
}) {
  const session = await auth();
  requirePermission(session, "customers:create");

  if (input.email) {
    const existing = await findByEmail(input.email);
    if (existing) throw new ConflictError("A customer with this email already exists");
  }

  if (input.leadId) {
    const existingByLead = await prisma.customer.findFirst({
      where: { leadId: input.leadId, deletedAt: null },
    });
    if (existingByLead) throw new ConflictError("A customer already exists for this lead");
  }

  const documentNo = await generateDocumentNo("CUST");

  const customer = await create({
    documentNo,
    name: input.name,
    email: input.email,
    phone: input.phone,
    taxId: input.taxId,
    website: input.website,
    creditLimit: input.creditLimit,
    paymentTerms: input.paymentTerms,
    leadId: input.leadId,
    createdById: session!.user.userId,
    businessId: session!.user.businessId!,billingAddress: input.billingLine1
      ? {
          line1: input.billingLine1,
          line2: input.billingLine2,
          city: input.billingCity || "",
          state: input.billingState,
          postalCode: input.billingPostalCode,
          country: input.billingCountry || "Philippines",
        }
      : undefined,
  });

  await audit({
    entityType: "Customer",
    entityId: customer.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: { documentNo: customer.documentNo, name: customer.name, status: customer.status },
  });

  await notifyBusinessStakeholders({
    actorId: session!.user.userId,
    type: "customer_created",
    title: "New Customer",
    message: `${customer.name} (${customer.documentNo}) was added`,
    entityType: "Customer",
    entityId: customer.id,
    link: `/customers/${customer.id}`,
  });

  return customer;
}

export async function convertFromOpportunity(opportunityId: string) {
  const session = await auth();
  requirePermission(session, "customers:create");

  const opp = await prisma.opportunity.findFirst({
    where: { id: opportunityId, deletedAt: null },
    include: { lead: true },
  });
  if (!opp) throw new NotFoundError("Opportunity", opportunityId);
  if (opp.status !== "CLOSED_WON") {
    throw new ConflictError("Opportunity must be CLOSED_WON to create a customer");
  }

  const lead = opp.lead;
  const customerName = lead?.company || `${lead?.firstName} ${lead?.lastName}`;

  if (lead?.email) {
    const existing = await findByEmail(lead.email);
    if (existing) throw new ConflictError("A customer with this email already exists");
  }

  const documentNo = await generateDocumentNo("CUST");

  const customer = await create({
    documentNo,
    name: customerName,
    email: lead?.email || undefined,
    phone: lead?.phone || undefined,
    leadId: opp.leadId,
    paymentTerms: 30,
    createdById: session!.user.userId,
  businessId: session!.user.businessId!,});

  await audit({
    entityType: "Customer",
    entityId: customer.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: {
      documentNo: customer.documentNo,
      name: customer.name,
      convertedFromOpportunity: opp.documentNo,
    },
    metadata: { action: "opportunity_conversion", opportunityId },
  });

  await notifyBusinessStakeholders({
    actorId: session!.user.userId,
    type: "customer_created",
    title: "New Customer",
    message: `${customer.name} (${customer.documentNo}) was created from ${opp.documentNo}`,
    entityType: "Customer",
    entityId: customer.id,
    link: `/customers/${customer.id}`,
  });

  return customer;
}

export async function update_(
  id: string,
  input: Partial<{
    name: string;
    email: string;
    phone: string;
    taxId: string;
    website: string;
    creditLimit: number;
    paymentTerms: number;
  }>
) {
  const session = await auth();
  requirePermission(session, "customers:update");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Customer", id);

  if (input.email && input.email !== existing.email) {
    const emailTaken = await findByEmail(input.email);
    if (emailTaken) throw new ConflictError("Email already in use by another customer");
  }

  const customer = await update(id, input);

  await audit({
    entityType: "Customer",
    entityId: id,
    action: "UPDATE",
    userId: session!.user.userId,
    previousState: { name: existing.name, email: existing.email, phone: existing.phone },
    newState: { name: customer.name, email: customer.email, phone: customer.phone },
  });

  return customer;
}

export async function transition(id: string, to: string) {
  const session = await auth();
  requirePermission(session, "customers:update");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Customer", id);

  if (!isValidTransition(existing.status, to)) {
    throw new ConflictError(`Cannot transition from ${existing.status} to ${to}`);
  }

  const customer = await updateStatus(id, to);

  await audit({
    entityType: "Customer",
    entityId: id,
    action: "TRANSITION",
    userId: session!.user.userId,
    previousState: { status: existing.status },
    newState: { status: to },
  });

  return customer;
}

export async function softDelete_(id: string) {
  const session = await auth();
  requirePermission(session, "customers:delete");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Customer", id);

  await softDelete(id);

  await audit({
    entityType: "Customer",
    entityId: id,
    action: "DELETE",
    userId: session!.user.userId,
    previousState: { documentNo: existing.documentNo, name: existing.name, status: existing.status },
  });
}

export async function restore_(id: string) {
  const session = await auth();
  requirePermission(session, "customers:delete");

  const existing = await findByIdIncludingDeleted(id, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Customer", id);
  if (!existing.deletedAt) throw new ConflictError("Customer is not deleted");

  const customer = await restore(id);

  await audit({
    entityType: "Customer",
    entityId: id,
    action: "UPDATE",
    userId: session!.user.userId,
    previousState: { deletedAt: existing.deletedAt },
    newState: { deletedAt: null },
    metadata: { action: "restore" },
  });

  return customer;
}
