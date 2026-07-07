"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/require-permission";
import { updateMany } from "@/features/setting/services/setting.service";
import { AppError } from "@/lib/errors";

export type SettingActionState = {
  success: boolean;
  error?: string;
};

export async function updateSettingsAction(
  _prev: SettingActionState,
  formData: FormData
): Promise<SettingActionState> {
  const session = await auth();
  requirePermission(session, "settings:update");

  const entries = formData.getAll("entries");
  if (entries.length === 0) {
    const keys = formData.getAll("key");
    const values = formData.getAll("value");
    const categories = formData.getAll("category");

    const settings = keys.map((key, i) => ({
      key: key as string,
      value: values[i] as string,
      category: (categories[i] as string) || "general",
    }));

    try {
      await updateMany(settings);
    } catch (e) {
      if (e instanceof AppError) return { success: false, error: e.message };
      return { success: false, error: "Failed to update settings" };
    }
  }

  revalidatePath("/settings");
  return { success: true };
}
