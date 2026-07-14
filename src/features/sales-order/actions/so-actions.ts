"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { soCreateSchema } from "@/features/sales-order/schemas/so-create";
import {
  create_,
  convertFromQuotation,
  transition,
  softDelete_,
  restore_,
} from "@/features/sales-order/services/so.service";
import { AppError } from "@/lib/errors";

export type SOActionState = { success: boolean; error?: string };

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

export async function createSOAction(_prev: SOActionState, formData: FormData): Promise<SOActionState> {
  const parsed = soCreateSchema.safeParse({
    customerId: formData.get("customerId"),
    quotationId: formData.get("quotationId") || undefined,
    orderDate: formData.get("orderDate"),
    expectedDeliveryDate: formData.get("expectedDeliveryDate") || undefined,
    discountTotal: Number(formData.get("discountTotal") || 0),
    taxRate: Number(formData.get("taxRate") || 0),
    notes: formData.get("notes") || undefined,
    items: parseItems(formData),
  });

  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  try {
    const so = await create_(parsed.data);
    revalidatePath("/sales-orders");
    redirect(`/sales-orders/${so.id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    const detail = e instanceof Error ? e.message : String(e);
    return { success: false, error: `Failed to create sales order: ${detail}` };
  }
}

export async function convertQuotationAction(quotationId: string, customerId: string): Promise<SOActionState> {
  try {
    const so = await convertFromQuotation(quotationId, customerId);
    revalidatePath("/sales-orders");
    redirect(`/sales-orders/${so.id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to convert quotation" };
  }
}

export async function deleteSOAction(id: string) {
  try { await softDelete_(id); } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to delete" };
  }
  revalidatePath("/sales-orders");
  redirect("/sales-orders");
}

export async function restoreSOAction(id: string) {
  try { await restore_(id); } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to restore" };
  }
  revalidatePath("/sales-orders");
  redirect(`/sales-orders/${id}`);
}

export async function transitionSOAction(id: string, to: string) {
  try { await transition(id, to); } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to transition" };
  }
  revalidatePath(`/sales-orders/${id}`);
  redirect(`/sales-orders/${id}`);
}
