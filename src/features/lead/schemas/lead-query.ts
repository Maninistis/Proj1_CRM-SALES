import { z } from "zod";

export const leadQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "DISQUALIFIED"]).optional(),
  source: z.enum(["WEBSITE", "REFERRAL", "COLD_CALL", "EVENT", "OTHER"]).optional(),
  deleted: z.enum(["true", "false"]).default("false"),
});

export type LeadQueryInput = z.infer<typeof leadQuerySchema>;
