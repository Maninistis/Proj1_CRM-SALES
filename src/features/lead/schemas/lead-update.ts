import { z } from "zod";

export const leadUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  jobTitle: z.string().optional().or(z.literal("")),
  source: z.enum(["WEBSITE", "REFERRAL", "COLD_CALL", "EVENT", "OTHER"]).optional(),
  assignedToId: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;
