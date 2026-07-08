"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { dnCreateSchema } from "@/features/delivery-note/schemas/dn-create";
import {
  create_,
  transition,
  softDelete_,
  restore_,
} from "@/features/delivery-note/services/dn.service";
import { AppError } from "@/lib/errors";

export type DNActionState = { success: boolean; error?: string };

function parseItems(formData: FormData) {
  const items = [];
  let i = 0;
  while (formData.has(`items.${i}.salesOrderItemId`)) {
    items.push({
      salesOrderItemId: String(formData.get(`items.${i}.salesOrderItemId`) || ""),
      description: String(formData.get(`items.${i}.description`) || ""),
      quantity: Number(formData.get(`items.${i}.quantity`) || 0),
    });
    i++;
  }
  return items;
}

export async function createDNAction(_prev: DNActionState, formData: FormData): Promise<DNActionState> {
  const parsed = dnCreateSchema.safeParse({
    salesOrderId: formData.get("salesOrderId"),
    deliveryDate: formData.get("deliveryDate") || undefined,
    carrier: formData.get("carrier") || undefined,
    trackingNumber: formData.get("trackingNumber") || undefined,
    notes: formData.get("notes") || undefined,
    items: parseItems(formData),
  });

  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  try {
    const dn = await create_(parsed.data);
    revalidatePath("/delivery-notes");
    redirect(`/delivery-notes/${dn.id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to create delivery note" };
  }
}

export async function deleteDNAction(id: string) {
  try { await softDelete_(id); } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to delete" };
  }
  revalidatePath("/delivery-notes");
  redirect("/delivery-notes");
}

export async function restoreDNAction(id: string) {
  try { await restore_(id); } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to restore" };
  }
  revalidatePath("/delivery-notes");
  redirect(`/delivery-notes/${id}`);
}

export async function transitionDNAction(id: string, to: string) {
  try { await transition(id, to); } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to transition" };
  }
  revalidatePath(`/delivery-notes/${id}`);
  redirect(`/delivery-notes/${id}`);
}
