import { z } from "zod";

export const customerCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().min(1, "Phone is required"),
  taxId: z.string().min(1, "TIN / Tax ID is required"),
  website: z.string().optional().or(z.literal("")),
  creditLimit: z.number().min(0, "Credit limit is required"),
  paymentTerms: z.number().min(0),
  leadId: z.string().optional(),
  billingLine1: z.string().min(1, "Address is required"),
  billingLine2: z.string().min(1, "Address line 2 is required"),
  billingCity: z.string().min(1, "City is required"),
  billingState: z.string().min(1, "Province is required"),
  billingPostalCode: z.string().min(1, "Postal code is required"),
  billingCountry: z.string().min(1, "Country is required"),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
