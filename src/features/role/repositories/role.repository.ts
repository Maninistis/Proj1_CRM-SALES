import { prisma } from "@/lib/prisma";
import { skipTake } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";

const roleInclude = {
  rolePermissions: { include: { permission: true } },
  _count: { select: { users: true } },
} satisfies Prisma.RoleInclude;

export async function findMany(params: {
  page: number;
  pageSize: number;
  search?: string;
}) {
  const where: Prisma.RoleWhereInput = params.search
    ? { name: { contains: params.search } }
    : {};

  const [data, total] = await Promise.all([
    prisma.role.findMany({
      where,
      include: roleInclude,
      ...skipTake(params),
      orderBy: { createdAt: "desc" },
    }),
    prisma.role.count({ where }),
  ]);

  return { data, total };
}

export async function findById(id: string) {
  return prisma.role.findUnique({
    where: { id },
    include: roleInclude,
  });
}

export async function findByName(name: string) {
  return prisma.role.findUnique({ where: { name } });
}

export async function create(data: {
  name: string;
  description?: string;
}) {
  return prisma.role.create({
    data,
    include: roleInclude,
  });
}

export async function update(
  id: string,
  data: { name?: string; description?: string }
) {
  return prisma.role.update({
    where: { id },
    data,
    include: roleInclude,
  });
}

export async function deleteRole(id: string) {
  return prisma.role.delete({ where: { id } });
}

export async function setPermissions(
  roleId: string,
  permissionIds: string[]
) {
  await prisma.rolePermission.deleteMany({
    where: { roleId },
  });

  if (permissionIds.length > 0) {
    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      })),
    });
  }

  return prisma.role.findUnique({
    where: { id: roleId },
    include: roleInclude,
  });
}

export async function findAllPermissions() {
  return prisma.permission.findMany({
    orderBy: { code: "asc" },
  });
}

export async function getAllRoles() {
  return prisma.role.findMany({
    orderBy: { name: "asc" },
    include: {
      rolePermissions: { include: { permission: true } },
      _count: { select: { users: true } },
    },
  });
}

export type RoleWithPermissions = Prisma.RoleGetPayload<{
  include: typeof roleInclude;
}>;
