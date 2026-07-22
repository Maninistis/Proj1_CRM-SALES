import { prisma } from "@/lib/prisma";
import { skipTake } from "@/lib/pagination";
import type { Prisma } from "@prisma/client";

const userInclude = {
  role: true,
} satisfies Prisma.UserInclude;

export async function findMany(params: {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  managerId?: string;
  businessMembership?: Prisma.BusinessUserWhereInput;
}) {
  const where: Prisma.UserWhereInput = {
    ...(params.status && { status: params.status }),
    ...(params.managerId && { managerId: params.managerId }),
    ...(params.businessMembership && { businessMemberships: { some: params.businessMembership } }),
    ...(params.search && {
      OR: [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { role: { name: { contains: params.search } } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: userInclude,
      ...skipTake(params),
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { data, total };
}

export async function findById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: userInclude,
  });
}

export async function create(data: {
  name: string;
  email: string;
  passwordHash: string;
  roleRoleId: string;
  status: string;
  phone?: string;
  image?: string;
  managerId?: string;
  requirePasswordChange?: boolean;
}) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      roleRoleId: data.roleRoleId,
      status: data.status,
      phone: data.phone || null,
      image: data.image || null,
      managerId: data.managerId || null,
      requirePasswordChange: data.requirePasswordChange ?? false,
    },
    include: userInclude,
  });
}

export async function update(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    roleRoleId: string;
    status: string;
    phone: string;
    image: string;
    passwordHash: string;
  }>
) {
  return prisma.user.update({
    where: { id },
    data,
    include: userInclude,
  });
}

export async function softDelete(id: string) {
  return prisma.user.update({
    where: { id },
    data: { status: "INACTIVE" },
  });
}

export type UserWithRole = Prisma.UserGetPayload<{ include: typeof userInclude }>;
