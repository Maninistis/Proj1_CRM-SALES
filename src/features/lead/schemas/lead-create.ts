import { z } from "zod";

export const leadCreateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().min(1, "Phone is required"),
  company: z.string().optional().or(z.literal("")),
  jobTitle: z.string().min(1, "Job title is required"),
  source: z.enum(["WEBSITE", "REFERRAL", "COLD_CALL", "EVENT", "OTHER"]),
  assignedToId: z.string().min(1, "Assignee is required"),
  notes: z.string().optional().or(z.literal("")),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;
