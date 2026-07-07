import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth/auth";
import { audit } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/require-permission";
import { NotFoundError, ConflictError } from "@/lib/errors";
import {
  findMany,
  findById,
  create,
  update,
  softDelete,
} from "../repositories/user-crud.repository";
import { findUserByEmail } from "../repositories/user.repository";

const BCRYPT_ROUNDS = 12;

export async function list(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}) {
  const session = await auth();
  requirePermission(session, "users:read");
  return findMany(params);
}

export async function getById(id: string) {
  const session = await auth();
  requirePermission(session, "users:read");
  const user = await findById(id);
  if (!user) throw new NotFoundError("User", id);
  return user;
}

export async function create_(input: {
  name: string;
  email: string;
  password: string;
  roleRoleId: string;
  status: string;
}) {
  const session = await auth();
  requirePermission(session, "users:create");

  const existing = await findUserByEmail(input.email);
  if (existing) throw new ConflictError("Email already registered");

  const passwordHash = bcrypt.hashSync(input.password, BCRYPT_ROUNDS);
  const user = await create({
    name: input.name,
    email: input.email,
    passwordHash,
    roleRoleId: input.roleRoleId,
    status: input.status,
  });

  await audit({
    entityType: "User",
    entityId: user.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: { name: user.name, email: user.email, role: user.role.name },
  });

  return user;
}

export async function update_(
  id: string,
  input: Partial<{
    name: string;
    email: string;
    roleRoleId: string;
    status: string;
  }>
) {
  const session = await auth();
  requirePermission(session, "users:update");

  const existing = await findById(id);
  if (!existing) throw new NotFoundError("User", id);

  if (input.email && input.email !== existing.email) {
    const emailTaken = await findUserByEmail(input.email);
    if (emailTaken) throw new ConflictError("Email already in use");
  }

  const user = await update(id, input);

  await audit({
    entityType: "User",
    entityId: id,
    action: "UPDATE",
    userId: session!.user.userId,
    previousState: { name: existing.name, email: existing.email, status: existing.status },
    newState: { name: user.name, email: user.email, status: user.status },
  });

  return user;
}

export async function deactivate(id: string) {
  const session = await auth();
  requirePermission(session, "users:delete");

  const existing = await findById(id);
  if (!existing) throw new NotFoundError("User", id);

  await softDelete(id);

  await audit({
    entityType: "User",
    entityId: id,
    action: "DELETE",
    userId: session!.user.userId,
    previousState: { name: existing.name, email: existing.email },
  });
}
