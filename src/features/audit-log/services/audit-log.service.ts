import { auth } from "@/lib/auth/auth";
import { requirePermission } from "@/lib/auth/require-permission";
import { findMany } from "../repositories/audit-log.repository";

export async function list(params: {
  page: number;
  pageSize: number;
  entityType?: string;
  userId?: string;
  search?: string;
}) {
  const session = await auth();
  requirePermission(session, "audit-logs:read");
  return findMany(params);
}
