"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { roleCreateSchema } from "@/features/role/schemas/role-create";
import { roleUpdateSchema } from "@/features/role/schemas/role-update";
import {
  create_,
  update_,
  remove,
} from "@/features/role/services/role.service";
import { AppError } from "@/lib/errors";

export type RoleActionState = {
  success: boolean;
  error?: string;
};

export async function createRoleAction(
  _prev: RoleActionState,
  formData: FormData
): Promise<RoleActionState> {
  const permissionIds = formData.getAll("permissionIds");
  const parsed = roleCreateSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    permissionIds,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await create_(parsed.data);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to create role" };
  }

  revalidatePath("/roles");
  redirect("/roles");
}

export async function updateRoleAction(
  id: string,
  _prev: RoleActionState,
  formData: FormData
): Promise<RoleActionState> {
  const permissionIds = formData.getAll("permissionIds");
  const parsed = roleUpdateSchema.safeParse({
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
    permissionIds,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await update_(id, parsed.data);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to update role" };
  }

  revalidatePath("/roles");
  redirect("/roles");
}

export async function deleteRoleAction(id: string) {
  try {
    await remove(id);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to delete role" };
  }

  revalidatePath("/roles");
  return { success: true };
}
