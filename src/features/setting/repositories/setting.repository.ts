import { prisma } from "@/lib/prisma";

export async function findAll() {
  return prisma.setting.findMany({
    orderBy: { category: "asc" },
  });
}

export async function findByKey(key: string) {
  return prisma.setting.findUnique({ where: { key } });
}

export async function upsert(key: string, value: string, category: string, updatedById: string) {
  return prisma.setting.upsert({
    where: { key },
    update: { value, category, updatedById },
    create: { key, value, category, updatedById },
  });
}
