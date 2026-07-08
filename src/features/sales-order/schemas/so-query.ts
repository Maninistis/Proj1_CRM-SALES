import { z } from "zod";

export const soQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z
    .enum(["DRAFT", "PENDING", "CONFIRMED", "FULFILLING", "DELIVERED", "INVOICED", "COMPLETED", "CANCELLED"])
    .optional(),
  deleted: z.enum(["true", "false"]).default("false"),
});

export type SOQueryInput = z.infer<typeof soQuerySchema>;
