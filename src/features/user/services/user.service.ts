import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth/auth";
import { audit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notify";
import { requirePermission } from "@/lib/auth/require-permission";
import { hasPermission } from "@/lib/auth/permissions";
import { NotFoundError, ConflictError, ForbiddenError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
  findMany,
  findById,
  create,
  update,
  softDelete,
} from "../repositories/user-crud.repository";
import { findUserByEmail } from "../repositories/user.repository";

const BCRYPT_ROUNDS = 12;

function isManager(permissions: string[]): boolean {
  return !hasPermission(permissions, "*") && hasPermission(permissions, "users:read");
}

export async function list(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}) {
  const session = await auth();
  requirePermission(session, "users:read");

  if (isManager(session!.user.permissions)) {
    return findMany({ ...params, managerId: session!.user.userId });
  }

  return findMany(params);
}

export async function getById(id: string) {
  const session = await auth();
  requirePermission(session, "users:read");

  const user = await findById(id);
  if (!user) throw new NotFoundError("User", id);

  if (isManager(session!.user.permissions) && user.managerId !== session!.user.userId) {
    throw new ForbiddenError("You can only view your own team members");
  }

  return user;
}

export async function create_(input: {
  name: string;
  email: string;
  password: string;
  roleRoleId: string;
  status: string;
  phone?: string;
  image?: string;
  managerId?: string;
  requirePasswordChange?: boolean;
}) {
  const session = await auth();
  requirePermission(session, "users:create");

  const existing = await findUserByEmail(input.email);
  if (existing) throw new ConflictError("Email already registered");

  let roleRoleId = input.roleRoleId;
  let managerId = input.managerId;

  if (isManager(session!.user.permissions)) {
    const repRole = await prisma.role.findUnique({ where: { name: "Sales Rep" } });
    if (!repRole) throw new NotFoundError("Role", "Sales Rep");
    roleRoleId = repRole.id;
    managerId = session!.user.userId;
  }

  const passwordHash = bcrypt.hashSync(input.password, BCRYPT_ROUNDS);
  const user = await create({
    name: input.name,
    email: input.email,
    passwordHash,
    roleRoleId,
    status: input.status,
    phone: input.phone,
    image: input.image,
    managerId,
    requirePasswordChange: input.requirePasswordChange,
  });

  await audit({
    entityType: "User",
    entityId: user.id,
    action: "CREATE",
    userId: session!.user.userId,
    newState: { name: user.name, email: user.email, role: user.role.name },
  });

  const admins = await prisma.user.findMany({
    where: {
      id: { not: session!.user.userId },
      status: "ACTIVE",
      role: { name: "Admin" },
    },
    select: { id: true },
  });
  await notifyUsers(
    admins.map((a) => a.id),
    {
      actorId: session!.user.userId,
      type: "user_created",
      title: "New User",
      message: `${user.name} (${user.email}) was created as ${user.role.name}`,
      entityType: "User",
      entityId: user.id,
      link: `/users/${user.id}`,
    }
  );

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

  const manager = isManager(session!.user.permissions);

  if (manager) {
    if (existing.managerId !== session!.user.userId) {
      throw new ForbiddenError("You can only edit your own team members");
    }
    input.roleRoleId = undefined;
    input.status = undefined;
  }

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
  requirePermission(session, "users:update");

  const existing = await findById(id);
  if (!existing) throw new NotFoundError("User", id);

  if (isManager(session!.user.permissions)) {
    if (existing.managerId !== session!.user.userId) {
      throw new ForbiddenError("You can only deactivate your own team members");
    }
  }

  await softDelete(id);

  await audit({
    entityType: "User",
    entityId: id,
    action: "DELETE",
    userId: session!.user.userId,
    previousState: { name: existing.name, email: existing.email },
  });
}
