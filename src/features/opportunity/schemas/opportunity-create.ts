import { z } from "zod";

export const opportunityCreateSchema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  estimatedValue: z.number().min(0, "Value must be positive"),
  expectedCloseDate: z.string().min(1, "Expected close date is required"),
  assignedToId: z.string().optional().or(z.literal("")),
});

export type OpportunityCreateInput = z.infer<typeof opportunityCreateSchema>;
