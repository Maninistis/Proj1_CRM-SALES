import { z } from "zod";

export const opportunityQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  stage: z
    .enum([
      "PROSPECTING",
      "QUALIFICATION",
      "NEEDS_ANALYSIS",
      "VALUE_PROPOSITION",
      "NEGOTIATION",
    ])
    .optional(),
  status: z.enum(["OPEN", "CLOSED_WON", "CLOSED_LOST"]).optional(),
  deleted: z.enum(["true", "false"]).default("false"),
});

export type OpportunityQueryInput = z.infer<typeof opportunityQuerySchema>;
