import { z } from "zod";

export const customerUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.number().min(0).optional(),
});

export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
