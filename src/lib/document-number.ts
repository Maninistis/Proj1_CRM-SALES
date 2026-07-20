import { prisma } from "@/lib/prisma";
import { getCurrentBusinessId } from "@/lib/auth/business";

const PAD_LENGTH = 4;

export async function generateDocumentNo(prefix: string): Promise<string> {
  const businessId = (await getCurrentBusinessId()) ?? "";
  const counter = await prisma.counter.upsert({
    where: { prefix_businessId: { prefix, businessId } },
    update: { sequence: { increment: 1 } },
    create: { prefix, sequence: 1, businessId },
  });

  return `${prefix}-${String(counter.sequence).padStart(PAD_LENGTH, "0")}`;
}
