"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { quotationCreateSchema } from "@/features/quotation/schemas/quotation-create";
import { quotationUpdateSchema } from "@/features/quotation/schemas/quotation-update";
import {
  create_,
  update_,
  transition,
  duplicate,
  softDelete_,
  restore_,
} from "@/features/quotation/services/quotation.service";
import { AppError } from "@/lib/errors";

export type QuoteActionState = {
  success: boolean;
  error?: string;
};

function parseItems(formData: FormData) {
  const items = [];
  let i = 0;
  while (formData.has(`items.${i}.description`)) {
    items.push({
      description: String(formData.get(`items.${i}.description`) || ""),
      quantity: Number(formData.get(`items.${i}.quantity`) || 0),
      unitPrice: Number(formData.get(`items.${i}.unitPrice`) || 0),
      discountPercent: Number(formData.get(`items.${i}.discountPercent`) || 0),
    });
    i++;
  }
  return items;
}

export async function createQuotationAction(
  _prev: QuoteActionState,
  formData: FormData
): Promise<QuoteActionState> {
  const parsed = quotationCreateSchema.safeParse({
    opportunityId: formData.get("opportunityId"),
    subject: formData.get("subject"),
    validUntil: formData.get("validUntil"),
    currency: formData.get("currency") || "PHP",
    discountTotal: Number(formData.get("discountTotal") || 0),
    taxRate: Number(formData.get("taxRate") || 0),
    notes: formData.get("notes") || undefined,
    items: parseItems(formData),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    const quote = await create_(parsed.data);
    revalidatePath("/quotations");
    redirect(`/quotations/${quote.id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to create quotation" };
  }
}

export async function updateQuotationAction(
  id: string,
  _prev: QuoteActionState,
  formData: FormData
): Promise<QuoteActionState> {
  const hasItems = formData.has("items.0.description");

  const parsed = quotationUpdateSchema.safeParse({
    subject: formData.get("subject") || undefined,
    validUntil: formData.get("validUntil") || undefined,
    discountTotal: Number(formData.get("discountTotal") || 0),
    taxRate: Number(formData.get("taxRate") || 0),
    notes: formData.get("notes") || undefined,
    items: hasItems ? parseItems(formData) : undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await update_(id, parsed.data);
    revalidatePath("/quotations");
    redirect(`/quotations/${id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to update quotation" };
  }
}

export async function deleteQuotationAction(id: string) {
  try {
    await softDelete_(id);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to delete quotation" };
  }
  revalidatePath("/quotations");
  redirect("/quotations");
}

export async function restoreQuotationAction(id: string) {
  try {
    await restore_(id);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to restore quotation" };
  }
  revalidatePath("/quotations");
  redirect(`/quotations/${id}`);
}

export async function duplicateQuotationAction(id: string) {
  try {
    const quote = await duplicate(id);
    revalidatePath("/quotations");
    redirect(`/quotations/${quote.id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to duplicate quotation" };
  }
}

export async function transitionQuotationAction(id: string, to: string) {
  try {
    await transition(id, to);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to transition quotation" };
  }
  revalidatePath(`/quotations/${id}`);
  const qs = to === "ACCEPTED" ? "?accepted=true" : "";
  redirect(`/quotations/${id}${qs}`);
}
