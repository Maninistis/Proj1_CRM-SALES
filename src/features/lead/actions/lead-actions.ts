"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { leadCreateSchema } from "@/features/lead/schemas/lead-create";
import { leadUpdateSchema } from "@/features/lead/schemas/lead-update";
import {
  create_,
  update_,
  transition,
  softDelete_,
  restore_,
  deleteDisqualifiedLeads,
} from "@/features/lead/services/lead.service";
import { AppError } from "@/lib/errors";

export type LeadActionState = {
  success: boolean;
  error?: string;
};

export async function createLeadAction(
  _prev: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  const parsed = leadCreateSchema.safeParse({
    firstName: formData.get("firstName") ?? "",
    lastName: formData.get("lastName") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    company: formData.get("company") ?? "",
    jobTitle: formData.get("jobTitle") ?? "",
    source: formData.get("source") || "OTHER",
    assignedToId: formData.get("assignedToId") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    const lead = await create_(parsed.data);
    revalidatePath("/leads");
    redirect(`/leads/${lead.id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    const detail = e instanceof Error ? e.message : String(e);
    return { success: false, error: `Failed to create lead: ${detail}` };
  }
}

export async function updateLeadAction(
  id: string,
  _prev: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  const parsed = leadUpdateSchema.safeParse({
    firstName: formData.get("firstName") ?? "",
    lastName: formData.get("lastName") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    company: formData.get("company") ?? "",
    jobTitle: formData.get("jobTitle") ?? "",
    source: formData.get("source") ?? "OTHER",
    assignedToId: formData.get("assignedToId") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await update_(id, parsed.data);
    revalidatePath("/leads");
    redirect(`/leads/${id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to update lead" };
  }
}

export async function deleteLeadAction(id: string) {
  try {
    await softDelete_(id);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to delete lead" };
  }
  revalidatePath("/leads");
  redirect("/leads");
}

export async function deleteLeadRowAction(id: string) {
  try {
    await softDelete_(id);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to delete lead" };
  }
  revalidatePath("/leads");
}

export async function deleteDisqualifiedLeadsAction() {
  try {
    await deleteDisqualifiedLeads();
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to delete disqualified leads" };
  }
  revalidatePath("/leads");
}

export async function restoreLeadAction(id: string) {
  try {
    await restore_(id);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to restore lead" };
  }
  revalidatePath("/leads");
  redirect(`/leads/${id}`);
}

export async function transitionLeadAction(id: string, to: string) {
  try {
    await transition(id, to);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to transition lead" };
  }
  revalidatePath(`/leads/${id}`);
  redirect(`/leads/${id}`);
}
