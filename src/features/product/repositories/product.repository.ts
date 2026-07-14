import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function findMany(params: {
  search?: string;
  category?: string;
  activeOnly?: boolean;
}) {
  const where: Prisma.ProductWhereInput = {
    ...(params.activeOnly && { isActive: true }),
    ...(params.category && { category: params.category }),
    ...(params.search && {
      OR: [
        { name: { contains: params.search } },
        { description: { contains: params.search } },
        { category: { contains: params.search } },
      ],
    }),
  };

  return prisma.product.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function findById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function create(data: {
  name: string;
  description?: string;
  defaultPrice: number;
  category: string;
}) {
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description || null,
      defaultPrice: data.defaultPrice,
      category: data.category,
    },
  });
}

export async function update(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    defaultPrice: number;
    category: string;
    isActive: boolean;
  }>
) {
  return prisma.product.update({
    where: { id },
    data: {
      ...data,
      description: data.description ?? undefined,
    },
  });
}

export async function findActive() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}
