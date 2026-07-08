import { z } from "zod";

export const customerQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["NEW", "ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
  deleted: z.enum(["true", "false"]).default("false"),
});

export type CustomerQueryInput = z.infer<typeof customerQuerySchema>;
