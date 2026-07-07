import { auth } from "@/lib/auth/auth";
import { audit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/require-permission";
import { NotFoundError, ConflictError } from "@/lib/errors";
import {
  findMany,
  findById,
  findByName,
  create,
  update,
  deleteRole,
  setPermissions,
  findAllPermissions,
} from "../repositories/role.repository";

const SYSTEM_ROLES = ["Admin", "Sales Manager", "Sales Rep", "Accountant"];

export async function list(params: {
  page: number;
  pageSize: number;
  search?: string;
}) {
  const session = await auth();
  requirePermission(session, "roles:read");
  return findMany(params);
}

export async function getById(id: string) {
  const session = await auth();
  requirePermission(session, "roles:read");
  const role = await findById(id);
  if (!role) throw new NotFoundError("Role", id);
  return role;
}

export async function create_(input: {
  name: string;
  description?: string;
  permissionIds: string[];
}) {
  const session = await auth();
  requirePermission(session, "roles:create");

  const existing = await findByName(input.name);
  if (existing) throw new ConflictError("Role name already exists");

  const role = await create({ name: input.name, description: input.description });

  if (input.permissionIds.length > 0) {
    await setPermissions(role.id, input.permissionIds);
  }

  const updated = await findById(role.id);

  await audit({
    entityType: "Role",
    entityId: role.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: { name: role.name, permissions: input.permissionIds.length },
  });

  return updated;
}

export async function update_(
  id: string,
  input: { name?: string; description?: string; permissionIds?: string[] }
) {
  const session = await auth();
  requirePermission(session, "roles:update");

  const existing = await findById(id);
  if (!existing) throw new NotFoundError("Role", id);

  if (input.name && input.name !== existing.name) {
    const nameTaken = await findByName(input.name);
    if (nameTaken) throw new ConflictError("Role name already exists");
  }

  const role = await update(id, {
    name: input.name,
    description: input.description,
  });

  if (input.permissionIds !== undefined) {
    await setPermissions(id, input.permissionIds);
  }

  const updated = await findById(id);

  await audit({
    entityType: "Role",
    entityId: id,
    action: "UPDATE",
    userId: session!.user.userId,
    previousState: {
      name: existing.name,
      permissionCount: existing.rolePermissions.length,
    },
    newState: {
      name: updated?.name,
      permissionCount: updated?.rolePermissions.length,
    },
  });

  return updated;
}

export async function remove(id: string) {
  const session = await auth();
  requirePermission(session, "roles:update");

  const existing = await findById(id);
  if (!existing) throw new NotFoundError("Role", id);

  if (SYSTEM_ROLES.includes(existing.name)) {
    throw new ConflictError("Cannot delete a system role");
  }

  if (existing._count.users > 0) {
    throw new ConflictError(
      `Cannot delete role with ${existing._count.users} assigned user(s)`
    );
  }

  await deleteRole(id);

  await audit({
    entityType: "Role",
    entityId: id,
    action: "DELETE",
    userId: session!.user.userId,
    previousState: { name: existing.name },
  });
}

export async function getAllPermissions() {
  const session = await auth();
  requirePermission(session, "roles:read");
  return findAllPermissions();
}
