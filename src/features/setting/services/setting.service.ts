import { auth } from "@/lib/auth/auth";
import { audit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/require-permission";
import { findAll, findByKey, upsert } from "../repositories/setting.repository";

export async function list() {
  const session = await auth();
  requirePermission(session, "settings:read");
  return findAll();
}

export async function get(key: string) {
  const session = await auth();
  requirePermission(session, "settings:read");
  return findByKey(key);
}

export async function updateMany(
  settings: { key: string; value: string; category: string }[]
) {
  const session = await auth();
  requirePermission(session, "settings:update");

  for (const s of settings) {
    const existing = await findByKey(s.key);
    await upsert(s.key, s.value, s.category, session!.user.userId);

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
