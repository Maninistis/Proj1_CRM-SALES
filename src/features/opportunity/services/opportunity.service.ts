import { auth } from "@/lib/auth/auth";
import { audit } from "@/lib/audit";
import { generateDocumentNo } from "@/lib/document-number";
import { requirePermission } from "@/lib/auth/require-permission";
import { getScopeUserId } from "@/lib/auth/data-scope";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import {
  isValidStageTransition,
  canCloseWon,
  canCloseLost,
  canReopen,
  getNextStage,
} from "../types";
import { findById as findLeadById } from "@/features/lead/repositories/lead.repository";
import {
  findMany,
  findById,
  findByIdIncludingDeleted,
  findByLeadId,
  create,
  update,
  updateStageAndStatus,
  softDelete,
  restore,
} from "../repositories/opportunity.repository";

export async function list(params: {
  page: number;
  pageSize: number;
  search?: string;
  stage?: string;
  status?: string;
  deleted?: boolean;
}) {
  const session = await auth();
  requirePermission(session, "opportunities:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  return findMany({ ...params, scopeUserId, businessId: session!.user.businessId! });
}

export async function getById(id: string) {
  const session = await auth();
  requirePermission(session, "opportunities:read");
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);
  const opp = await findById(id, scopeUserId, session!.user.businessId!);
  if (!opp) throw new NotFoundError("Opportunity", id);
  return opp;
}

export async function create_(input: {
  leadId: string;
  title: string;
  description?: string;
  estimatedValue: number;
  expectedCloseDate: string;
  assignedToId?: string;
}) {
  const session = await auth();
  requirePermission(session, "opportunities:create");

  const lead = await findLeadById(input.leadId);
  if (!lead) throw new NotFoundError("Lead", input.leadId);

  const documentNo = await generateDocumentNo("OPP");

  const opp = await create({
    documentNo,
    leadId: input.leadId,
    title: input.title,
    description: input.description,
    estimatedValue: input.estimatedValue,
    expectedCloseDate: new Date(input.expectedCloseDate),
    assignedToId: input.assignedToId,
    createdById: session!.user.userId,
  businessId: session!.user.businessId!,});

  await audit({
    entityType: "Opportunity",
    entityId: opp.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: {
      documentNo: opp.documentNo,
      title: opp.title,
      estimatedValue: opp.estimatedValue.toString(),
      leadId: opp.leadId,
    },
  });

  return opp;
}

export async function convertLead(
  leadId: string,
  input: {
    title: string;
    estimatedValue: number;
    expectedCloseDate: string;
  }
) {
  const session = await auth();
  requirePermission(session, "opportunities:create");

  const lead = await findLeadById(leadId);
  if (!lead) throw new NotFoundError("Lead", leadId);

  if (lead.status !== "QUALIFIED") {
    throw new ConflictError("Lead must be QUALIFIED to convert");
  }

  const existing = await findByLeadId(leadId);
  if (existing) {
    throw new ConflictError("Lead already has an active opportunity");
  }

  const documentNo = await generateDocumentNo("OPP");

  const opp = await create({
    documentNo,
    leadId,
    title: input.title,
    estimatedValue: input.estimatedValue,
    expectedCloseDate: new Date(input.expectedCloseDate),
    assignedToId: lead.assignedToId ?? undefined,
    createdById: session!.user.userId,
  businessId: session!.user.businessId!,});

  await audit({
    entityType: "Opportunity",
    entityId: opp.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: {
      documentNo: opp.documentNo,
      title: opp.title,
      leadId,
      convertedFrom: lead.documentNo,
    },
    metadata: { action: "lead_conversion", leadId },
  });

  return opp;
}

export async function update_(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    estimatedValue: number;
    expectedCloseDate: string;
    stage: string;
    assignedToId: string;
    lossReason: string;
  }>
) {
  const session = await auth();
  requirePermission(session, "opportunities:update");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Opportunity", id);

  if (
    input.stage &&
    input.stage !== existing.stage &&
    existing.status === "OPEN"
  ) {
    if (!isValidStageTransition(existing.stage, input.stage)) {
      throw new ConflictError(
        `Cannot advance stage from ${existing.stage} to ${input.stage}`
      );
    }
  }

  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.description !== undefined) data.description = input.description;
  if (input.estimatedValue !== undefined)
    data.estimatedValue = input.estimatedValue;
  if (input.expectedCloseDate !== undefined)
    data.expectedCloseDate = new Date(input.expectedCloseDate);
  if (input.stage !== undefined) data.stage = input.stage;
  if (input.assignedToId !== undefined) data.assignedToId = input.assignedToId;
  if (input.lossReason !== undefined) data.lossReason = input.lossReason;

  const opp = await update(id, data);

  await audit({
    entityType: "Opportunity",
    entityId: id,
    action: "UPDATE",
    userId: session!.user.userId,
    previousState: {
      title: existing.title,
      stage: existing.stage,
      estimatedValue: existing.estimatedValue.toString(),
    },
    newState: {
      title: opp.title,
      stage: opp.stage,
      estimatedValue: opp.estimatedValue.toString(),
    },
  });

  return opp;
}

export async function advanceStage(id: string) {
  const session = await auth();
  requirePermission(session, "opportunities:update");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Opportunity", id);

  if (existing.status !== "OPEN") {
    throw new ConflictError("Cannot advance stage on a closed opportunity");
  }

  const nextStage = getNextStage(existing.stage);
  if (!nextStage) {
    throw new ConflictError("Already at the final stage (Negotiation)");
  }

  const opp = await updateStageAndStatus(id, { stage: nextStage });

  await audit({
    entityType: "Opportunity",
    entityId: id,
    action: "TRANSITION",
    userId: session!.user.userId,
    previousState: { stage: existing.stage },
    newState: { stage: nextStage },
  });

  return opp;
}

export async function closeWon(id: string) {
  const session = await auth();
  requirePermission(session, "opportunities:update");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Opportunity", id);

  if (!canCloseWon(existing.stage, existing.status)) {
    throw new ConflictError(
      "Can only close as Won from Negotiation stage"
    );
  }

  const opp = await updateStageAndStatus(id, { status: "CLOSED_WON" });

  await audit({
    entityType: "Opportunity",
    entityId: id,
    action: "TRANSITION",
    userId: session!.user.userId,
    previousState: { status: existing.status },
    newState: { status: "CLOSED_WON" },
  });

  return opp;
}

export async function closeLost(id: string, reason?: string) {
  const session = await auth();
  requirePermission(session, "opportunities:update");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Opportunity", id);

  if (!canCloseLost(existing.status)) {
    throw new ConflictError("Can only close as Lost from an open opportunity");
  }

  const opp = await updateStageAndStatus(id, {
    status: "CLOSED_LOST",
    lossReason: reason || null,
  });

  await audit({
    entityType: "Opportunity",
    entityId: id,
    action: "TRANSITION",
    userId: session!.user.userId,
    previousState: { status: existing.status },
    newState: { status: "CLOSED_LOST", lossReason: reason },
  });

  return opp;
}

export async function reopen(id: string) {
  const session = await auth();
  requirePermission(session, "opportunities:update");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Opportunity", id);

  if (!canReopen(existing.status)) {
    throw new ConflictError("Can only re-open a lost opportunity");
  }

  const opp = await updateStageAndStatus(id, {
    stage: "PROSPECTING",
    status: "OPEN",
    lossReason: null,
  });

  await audit({
    entityType: "Opportunity",
    entityId: id,
    action: "TRANSITION",
    userId: session!.user.userId,
    previousState: { status: existing.status },
    newState: { stage: "PROSPECTING", status: "OPEN" },
  });

  return opp;
}

export async function softDelete_(id: string) {
  const session = await auth();
  requirePermission(session, "opportunities:delete");

  const existing = await findById(id, undefined, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Opportunity", id);

  await softDelete(id);

  await audit({
    entityType: "Opportunity",
    entityId: id,
    action: "DELETE",
    userId: session!.user.userId,
    previousState: {
      documentNo: existing.documentNo,
      title: existing.title,
      status: existing.status,
    },
  });
}

export async function restore_(id: string) {
  const session = await auth();
  requirePermission(session, "opportunities:delete");

  const existing = await findByIdIncludingDeleted(id, session!.user.businessId!);
  if (!existing) throw new NotFoundError("Opportunity", id);
  if (!existing.deletedAt) {
    throw new ConflictError("Opportunity is not deleted");
  }

  const opp = await restore(id);

  await audit({
    entityType: "Opportunity",
    entityId: id,
    action: "UPDATE",
    userId: session!.user.userId,
    previousState: { deletedAt: existing.deletedAt },
    newState: { deletedAt: null },
    metadata: { action: "restore" },
  });

  return opp;
}
