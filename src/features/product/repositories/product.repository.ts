import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function findMany(params: {
  businessId?: string;
  search?: string;
  category?: string;
  activeOnly?: boolean;
}) {
  const where: Prisma.ProductWhereInput = {
    businessId: params.businessId,
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
  businessId: string;
  name: string;
  description?: string;
  defaultPrice: number;
  category: string;
}) {
  return prisma.product.create({
    data: {
      businessId: data.businessId,
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

export async function findActive(businessId: string) {
  return prisma.product.findMany({
    where: { isActive: true, businessId },
    orderBy: { name: "asc" },
  });
}
