import { z } from "zod";

export const opportunityUpdateSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional().or(z.literal("")),
  estimatedValue: z.number().min(0).optional(),
  expectedCloseDate: z.string().min(1).optional(),
  stage: z
    .enum([
      "PROSPECTING",
      "QUALIFICATION",
      "NEEDS_ANALYSIS",
      "VALUE_PROPOSITION",
      "NEGOTIATION",
    ])
    .optional(),
  assignedToId: z.string().optional().or(z.literal("")),
  lossReason: z.string().optional().or(z.literal("")),
});

export type OpportunityUpdateInput = z.infer<typeof opportunityUpdateSchema>;
