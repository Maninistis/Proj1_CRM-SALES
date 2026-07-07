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
}) {
  const where: Prisma.UserWhereInput = {
    ...(params.status && { status: params.status }),
    ...(params.search && {
      OR: [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
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
}) {
  return prisma.user.create({
    data,
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
