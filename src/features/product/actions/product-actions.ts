"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { productCreateSchema } from "@/features/product/schemas/product-schema";
import { productUpdateSchema } from "@/features/product/schemas/product-schema";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { AppError } from "@/lib/errors";

export type ProductActionState = {
  success: boolean;
  error?: string;
};

export async function createProductAction(
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const parsed = productCreateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    defaultPrice: Number(formData.get("defaultPrice")),
    category: formData.get("category") || "general",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    const session = await auth();
    await prisma.product.create({ data: { ...parsed.data, businessId: session!.user.businessId ?? "" } });
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to create product" };
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function updateProductAction(
  id: string,
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  const parsed = productUpdateSchema.safeParse({
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
    defaultPrice: Number(formData.get("defaultPrice")) || undefined,
    category: formData.get("category") || undefined,
    isActive: formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await prisma.product.update({ where: { id }, data: parsed.data });
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to update product" };
  }

  revalidatePath("/products");
  redirect("/products");
}

export async function deleteProductAction(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to delete product" };
  }

  revalidatePath("/products");
  return { success: true };
}
