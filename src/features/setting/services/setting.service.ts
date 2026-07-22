import { auth } from "@/lib/auth/auth";
import { audit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/require-permission";
import { findByKey, upsert } from "../repositories/setting.repository";

export async function get(key: string) {
  const session = await auth();
  requirePermission(session, "settings:read");
  return findByKey(key, session!.user.businessId ?? "");
}

export async function updateMany(
  settings: { key: string; value: string; category: string }[]
) {
  const session = await auth();
  requirePermission(session, "settings:update");
  const businessId = session!.user.businessId ?? "";

  for (const s of settings) {
    const existing = await findByKey(s.key, businessId);
    await upsert(s.key, s.value, s.category, session!.user.userId, businessId);

    await audit({
      entityType: "Setting",
      entityId: s.key,
      action: "UPDATE",
      userId: session!.user.userId,
      previousState: existing ? { value: existing.value } : undefined,
      newState: { value: s.value },
    });
  }
}
