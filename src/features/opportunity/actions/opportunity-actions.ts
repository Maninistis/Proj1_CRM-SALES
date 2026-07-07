"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { opportunityCreateSchema } from "@/features/opportunity/schemas/opportunity-create";
import { opportunityUpdateSchema } from "@/features/opportunity/schemas/opportunity-update";
import {
  create_,
  update_,
  convertLead,
  advanceStage,
  closeWon,
  closeLost,
  reopen,
  softDelete_,
  restore_,
} from "@/features/opportunity/services/opportunity.service";
import { AppError } from "@/lib/errors";

export type OpportunityActionState = {
  success: boolean;
  error?: string;
};

export async function createOpportunityAction(
  _prev: OpportunityActionState,
  formData: FormData
): Promise<OpportunityActionState> {
  const parsed = opportunityCreateSchema.safeParse({
    leadId: formData.get("leadId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    estimatedValue: Number(formData.get("estimatedValue")),
    expectedCloseDate: formData.get("expectedCloseDate"),
    assignedToId: formData.get("assignedToId") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    const opp = await create_(parsed.data);
    revalidatePath("/opportunities");
    redirect(`/opportunities/${opp.id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to create opportunity" };
  }
}

export async function convertLeadAction(
  leadId: string,
  _prev: OpportunityActionState,
  formData: FormData
): Promise<OpportunityActionState> {
  const title = formData.get("title") as string;
  const estimatedValue = Number(formData.get("estimatedValue"));
  const expectedCloseDate = formData.get("expectedCloseDate") as string;

  if (!title || !estimatedValue || !expectedCloseDate) {
    return { success: false, error: "All fields are required" };
  }

  try {
    const opp = await convertLead(leadId, {
      title,
      estimatedValue,
      expectedCloseDate,
    });
    revalidatePath("/opportunities");
    revalidatePath(`/leads/${leadId}`);
    redirect(`/opportunities/${opp.id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to convert lead" };
  }
}

export async function updateOpportunityAction(
  id: string,
  _prev: OpportunityActionState,
  formData: FormData
): Promise<OpportunityActionState> {
  const parsed = opportunityUpdateSchema.safeParse({
    title: formData.get("title") || undefined,
    description: formData.get("description") || undefined,
    estimatedValue: formData.get("estimatedValue") || undefined,
    expectedCloseDate: formData.get("expectedCloseDate") || undefined,
    stage: formData.get("stage") || undefined,
    assignedToId: formData.get("assignedToId") || undefined,
    lossReason: formData.get("lossReason") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await update_(id, parsed.data);
    revalidatePath("/opportunities");
    redirect(`/opportunities/${id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to update opportunity" };
  }
}

export async function deleteOpportunityAction(id: string) {
  try {
    await softDelete_(id);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to delete opportunity" };
  }
  revalidatePath("/opportunities");
  redirect("/opportunities");
}

export async function restoreOpportunityAction(id: string) {
  try {
    await restore_(id);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to restore opportunity" };
  }
  revalidatePath("/opportunities");
  redirect(`/opportunities/${id}`);
}

export async function advanceStageAction(id: string) {
  try {
    await advanceStage(id);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to advance stage" };
  }
  revalidatePath(`/opportunities/${id}`);
  redirect(`/opportunities/${id}`);
}

export async function closeWonAction(id: string) {
  try {
    await closeWon(id);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to close as won" };
  }
  revalidatePath(`/opportunities/${id}`);
  redirect(`/opportunities/${id}`);
}

export async function closeLostAction(id: string, reason?: string) {
  try {
    await closeLost(id, reason);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to close as lost" };
  }
  revalidatePath(`/opportunities/${id}`);
  redirect(`/opportunities/${id}`);
}

export async function reopenAction(id: string) {
  try {
    await reopen(id);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to reopen" };
  }
  revalidatePath(`/opportunities/${id}`);
  redirect(`/opportunities/${id}`);
}
