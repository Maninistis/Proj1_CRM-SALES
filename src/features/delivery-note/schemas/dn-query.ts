import { z } from "zod";

export const dnQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["DRAFT", "DISPATCHED", "DELIVERED", "ACKNOWLEDGED", "CANCELLED"]).optional(),
  deleted: z.enum(["true", "false"]).default("false"),
});

export type DNQueryInput = z.infer<typeof dnQuerySchema>;
