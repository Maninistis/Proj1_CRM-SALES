import { auth } from "@/lib/auth/auth";
import { audit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notify";
import { generateDocumentNo } from "@/lib/document-number";
import { requirePermission } from "@/lib/auth/require-permission";
import { getScopeUserId } from "@/lib/auth/data-scope";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { isValidTransition } from "../types";
import {
  findMany,
  findById,
  findByIdIncludingDeleted,
  create,
  update,
  updateStatus,
  softDelete,
  restore,
  softDeleteByStatus,
  countByStatus,
} from "../repositories/lead.repository";

export async function list(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  source?: string;
  deleted?: boolean;
}) {
  const session = await auth();
  requirePermission(session, "leads:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  return findMany({ ...params, scopeUserId, businessId: session!.user.businessId! });
}

export async function getById(id: string) {
  const session = await auth();
  requirePermission(session, "leads:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  const lead = await findById(id, scopeUserId, session!.user.businessId!);
  if (!lead) throw new NotFoundError("Lead", id);
  return lead;
}

export async function create_(input: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  source: string;
  assignedToId?: string;
  notes?: string;
}) {
  const session = await auth();
  requirePermission(session, "leads:create");

  const documentNo = await generateDocumentNo("LEAD");

  const lead = await create({
    documentNo,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    company: input.company,
    jobTitle: input.jobTitle,
    source: input.source,
    assignedToId: input.assignedToId,
    createdById: session!.user.userId,
    businessId: session!.user.businessId!,notes: input.notes,
  });

  await audit({
    entityType: "Lead",
    entityId: lead.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: {
      documentNo: lead.documentNo,
      name: `${lead.firstName} ${lead.lastName}`,
      source: lead.source,
      status: lead.status,
    },
  });

  if (input.assignedToId && input.assignedToId !== session!.user.userId) {
    await notifyUsers([input.assignedToId], {
      actorId: session!.user.userId,
      type: "lead_assigned",
      title: "New Lead Assigned",
      message: `${lead.firstName} ${lead.lastName} (${lead.documentNo}) was assigned to you`,
      entityType: "Lead",
      entityId: lead.id,
      link: `/leads/${lead.id}`,
    });
  }

  return lead;
}

export async function update_(
  id: string,
  input: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company: string;
    jobTitle: string;
    source: string;
    assignedToId: string;
    notes: string;
  }>
) {
  const session = await auth();
  requirePermission(session, "leads:update");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Lead", id);

  const lead = await update(id, input);

  await audit({
    entityType: "Lead",
    entityId: id,
    action: "UPDATE",
    userId: session!.user.userId,
    previousState: {
      firstName: existing.firstName,
      lastName: existing.lastName,
      email: existing.email,
      company: existing.company,
      source: existing.source,
    },
    newState: {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      company: lead.company,
      source: lead.source,
    },
  });

  if (
    input.assignedToId &&
    input.assignedToId !== existing.assignedToId &&
    input.assignedToId !== session!.user.userId
  ) {
    await notifyUsers([input.assignedToId], {
      actorId: session!.user.userId,
      type: "lead_assigned",
      title: "Lead Assigned to You",
      message: `${lead.firstName} ${lead.lastName} (${lead.documentNo}) was assigned to you`,
      entityType: "Lead",
      entityId: lead.id,
      link: `/leads/${lead.id}`,
    });
  }

  return lead;
}

export async function transition(id: string, to: string, reason?: string) {
  const session = await auth();
  requirePermission(session, "leads:update");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Lead", id);

  if (!isValidTransition(existing.status, to)) {
    throw new ConflictError(
      `Cannot transition from ${existing.status} to ${to}`
    );
  }

  const lead = await updateStatus(id, to);

  await audit({
    entityType: "Lead",
    entityId: id,
    action: "TRANSITION",
    userId: session!.user.userId,
    previousState: { status: existing.status },
    newState: { status: to },
    metadata: reason ? { reason } : undefined,
  });

  return lead;
}

export async function softDelete_(id: string) {
  const session = await auth();
  requirePermission(session, "leads:delete");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Lead", id);

  await softDelete(id);

  await audit({
    entityType: "Lead",
    entityId: id,
    action: "DELETE",
    userId: session!.user.userId,
    previousState: {
      documentNo: existing.documentNo,
      name: `${existing.firstName} ${existing.lastName}`,
      status: existing.status,
    },
  });
}

export async function restore_(id: string) {
  const session = await auth();
  requirePermission(session, "leads:delete");

  const existing = await findByIdIncludingDeleted(id, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Lead", id);
  if (!existing.deletedAt) {
    throw new ConflictError("Lead is not deleted");
  }

  const lead = await restore(id);

  await audit({
    entityType: "Lead",
    entityId: id,
    action: "UPDATE",
    userId: session!.user.userId,
    previousState: { deletedAt: existing.deletedAt },
    newState: { deletedAt: null },
    metadata: { action: "restore" },
  });

  return lead;
}

export async function deleteDisqualifiedLeads() {
  const session = await auth();
  requirePermission(session, "leads:delete");

  const result = await softDeleteByStatus("DISQUALIFIED");

  await audit({
    entityType: "Lead",
    entityId: "batch-disqualified",
    action: "DELETE",
    userId: session!.user.userId,
    metadata: { action: "batch_delete_disqualified", count: result.count },
  });

  return result.count;
}

export async function getDisqualifiedCount() {
  return countByStatus("DISQUALIFIED");
}
