"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { customerCreateSchema } from "@/features/customer/schemas/customer-create";
import { customerUpdateSchema } from "@/features/customer/schemas/customer-update";
import {
  create_,
  update_,
  transition,
  convertFromOpportunity,
  softDelete_,
  restore_,
} from "@/features/customer/services/customer.service";
import { AppError } from "@/lib/errors";

export type CustomerActionState = {
  success: boolean;
  error?: string;
};

export async function createCustomerAction(
  _prev: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const parsed = customerCreateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    taxId: formData.get("taxId"),
    website: formData.get("website"),
    creditLimit: Number(String(formData.get("creditLimit")).replace(/,/g, "")),
    paymentTerms: Number(formData.get("paymentTerms")) || 30,
    leadId: formData.get("leadId") || undefined,
    billingLine1: formData.get("billingLine1"),
    billingLine2: formData.get("billingLine2"),
    billingCity: formData.get("billingCity"),
    billingState: formData.get("billingState"),
    billingPostalCode: formData.get("billingPostalCode"),
    billingCountry: formData.get("billingCountry") || "Philippines",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    const customer = await create_(parsed.data);
    revalidatePath("/customers");

    const returnTo = formData.get("returnTo") as string | null;
    if (returnTo) {
      redirect(`${returnTo}?customerCreated=${customer.id}`);
    }
    redirect(`/customers/${customer.id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to create customer" };
  }
}

export async function updateCustomerAction(
  id: string,
  _prev: CustomerActionState,
  formData: FormData
): Promise<CustomerActionState> {
  const parsed = customerUpdateSchema.safeParse({
    name: formData.get("name") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    taxId: formData.get("taxId") || undefined,
    website: formData.get("website") || undefined,
    creditLimit: Number(formData.get("creditLimit")) || undefined,
    paymentTerms: Number(formData.get("paymentTerms")) || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await update_(id, parsed.data);
    revalidatePath("/customers");
    redirect(`/customers/${id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to update customer" };
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    await softDelete_(id);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to delete customer" };
  }
  revalidatePath("/customers");
  redirect("/customers");
}

export async function restoreCustomerAction(id: string) {
  try {
    await restore_(id);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to restore customer" };
  }
  revalidatePath("/customers");
  redirect(`/customers/${id}`);
}

export async function transitionCustomerAction(id: string, to: string) {
  try {
    await transition(id, to);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to transition customer" };
  }
  revalidatePath(`/customers/${id}`);
  redirect(`/customers/${id}`);
}

export async function convertOpportunityToCustomerAction(opportunityId: string) {
  try {
    const customer = await convertFromOpportunity(opportunityId);
    revalidatePath("/customers");
    redirect(`/customers/${customer.id}`);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { success: false, error: "Failed to convert opportunity" };
  }
}
