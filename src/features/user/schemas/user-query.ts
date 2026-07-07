import { z } from "zod";

export const userQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  sort: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type UserQueryInput = z.infer<typeof userQuerySchema>;
