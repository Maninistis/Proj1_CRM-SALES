"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { paymentCreateSchema } from "@/features/payment/schemas/payment-create";
import {
  create_,
  softDelete_,
  restore_,
} from "@/features/payment/services/payment.service";
import { AppError } from "@/lib/errors";

export type PaymentActionState = { success: boolean; error?: string };

export async function createPaymentAction(_prev: PaymentActionState, formData: FormData): Promise<PaymentActionState> {
  const parsed = paymentCreateSchema.safeParse({
    salesInvoiceId: formData.get("salesInvoiceId"),
    amount: Number(String(formData.get("amount")).replace(/,/g, "")),
    paymentMethod: formData.get("paymentMethod") || "CASH",
    referenceNumber: formData.get("referenceNumber") || undefined,
    paymentDate: formData.get("paymentDate"),
    proofImageUrl: formData.get("proofImageUrl") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  try {
    const payment = await create_(parsed.data);
    revalidatePath("/payments");
    revalidatePath(`/sales-invoices/${parsed.data.salesInvoiceId}`);
    redirect(`/payments/${payment.id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to record payment" };
  }
}

export async function deletePaymentAction(id: string, invoiceId: string) {
  try { await softDelete_(id); } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to delete" };
  }
  revalidatePath("/payments");
  revalidatePath(`/sales-invoices/${invoiceId}`);
  redirect("/payments");
}

export async function restorePaymentAction(id: string) {
  try { await restore_(id); } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to restore" };
  }
  revalidatePath("/payments");
  redirect(`/payments/${id}`);
}
