import { prisma } from "@/lib/prisma";

const PAD_LENGTH = 4;

export async function generateDocumentNo(prefix: string): Promise<string> {
  const counter = await prisma.counter.upsert({
    where: { prefix },
    update: { sequence: { increment: 1 } },
    create: { prefix, sequence: 1 },
  });

  return `${prefix}-${String(counter.sequence).padStart(PAD_LENGTH, "0")}`;
}
