import { z } from "zod";

export const customerCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  creditLimit: z.number().min(0).optional(),
  paymentTerms: z.number().min(0),
  billingLine1: z.string().optional().or(z.literal("")),
  billingLine2: z.string().optional().or(z.literal("")),
  billingCity: z.string().optional().or(z.literal("")),
  billingState: z.string().optional().or(z.literal("")),
  billingPostalCode: z.string().optional().or(z.literal("")),
  billingCountry: z.string(),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
