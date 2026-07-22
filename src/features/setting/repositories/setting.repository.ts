import { prisma } from "@/lib/prisma";

export async function findByKey(key: string, businessId: string) {
  return prisma.setting.findUnique({ where: { key_businessId: { key, businessId } } });
}

export async function upsert(key: string, value: string, category: string, updatedById: string, businessId: string) {
  return prisma.setting.upsert({
    where: { key_businessId: { key, businessId } },
    update: { value, category, updatedById },
    create: { key, value, category, updatedById, businessId },
  });
}
