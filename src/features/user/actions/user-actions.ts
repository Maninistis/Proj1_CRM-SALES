"use server";

import { redirect } from "next/navigation";
import { userCreateSchema } from "@/features/user/schemas/user-create";
import { userUpdateSchema } from "@/features/user/schemas/user-update";
import {
  create_,
  update_,
  deactivate,
} from "@/features/user/services/user.service";
import { AppError } from "@/lib/errors";
import { revalidatePath } from "next/cache";

export type UserActionState = {
  success: boolean;
  error?: string;
};

export async function createUserAction(
  _prev: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const parsed = userCreateSchema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    image: formData.get("image") ?? "",
    password: formData.get("password") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
    roleRoleId: formData.get("roleRoleId") ?? "",
    status: formData.get("status") || "ACTIVE",
    managerId: formData.get("managerId") ?? "",
    requirePasswordChange: formData.get("requirePasswordChange") === "on",
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await create_(parsed.data);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to create user" };
  }

  revalidatePath("/users");
  redirect("/users");
}

export async function updateUserAction(
  id: string,
  _prev: UserActionState,
  formData: FormData
): Promise<UserActionState> {
  const parsed = userUpdateSchema.safeParse({
    name: formData.get("name") || undefined,
    email: formData.get("email") || undefined,
    roleRoleId: formData.get("roleRoleId") || undefined,
    status: formData.get("status") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  try {
    await update_(id, parsed.data);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to update user" };
  }

  revalidatePath("/users");
  redirect("/users");
}

export async function deleteUserAction(id: string) {
  try {
    await deactivate(id);
  } catch (e) {
    if (e instanceof AppError) return { success: false, error: e.message };
    return { success: false, error: "Failed to delete user" };
  }

  revalidatePath("/users");
  return { success: true };
}
