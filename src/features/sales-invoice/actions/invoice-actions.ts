"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { invoiceCreateSchema } from "@/features/sales-invoice/schemas/invoice-create";
import {
  create_,
  generateFromSalesOrder,
  transition,
  softDelete_,
  restore_,
} from "@/features/sales-invoice/services/invoice.service";
import { AppError } from "@/lib/errors";

export type InvActionState = { success: boolean; error?: string };

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

export async function createInvoiceAction(_prev: InvActionState, formData: FormData): Promise<InvActionState> {
  const parsed = invoiceCreateSchema.safeParse({
    salesOrderId: formData.get("salesOrderId"),
    issueDate: formData.get("issueDate"),
    dueDate: formData.get("dueDate"),
    discountTotal: Number(formData.get("discountTotal") || 0),
    taxRate: Number(formData.get("taxRate") || 0),
    notes: formData.get("notes") || undefined,
    items: parseItems(formData),
  });

  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  try {
    const inv = await create_(parsed.data);
    revalidatePath("/sales-invoices");
    redirect(`/sales-invoices/${inv.id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to create invoice" };
  }
}

export async function generateFromSOAction(salesOrderId: string): Promise<InvActionState> {
  try {
    const inv = await generateFromSalesOrder(salesOrderId);
    revalidatePath("/sales-invoices");
    redirect(`/sales-invoices/${inv.id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to generate invoice" };
  }
}

export async function deleteInvoiceAction(id: string) {
  try { await softDelete_(id); } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to delete" };
  }
  revalidatePath("/sales-invoices");
  redirect("/sales-invoices");
}

export async function restoreInvoiceAction(id: string) {
  try { await restore_(id); } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to restore" };
  }
  revalidatePath("/sales-invoices");
  redirect(`/sales-invoices/${id}`);
}

export async function transitionInvoiceAction(id: string, to: string) {
  try { await transition(id, to); } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to transition" };
  }
  revalidatePath(`/sales-invoices/${id}`);
  redirect(`/sales-invoices/${id}`);
}
