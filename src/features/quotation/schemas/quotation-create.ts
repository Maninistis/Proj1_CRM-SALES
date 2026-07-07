import { z } from "zod";

export const quotationItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be > 0"),
  unitPrice: z.number().min(0, "Unit price must be >= 0"),
  discountPercent: z.number().min(0).max(100),
});

export const quotationCreateSchema = z.object({
  opportunityId: z.string().min(1, "Opportunity is required"),
  subject: z.string().min(1, "Subject is required"),
  validUntil: z.string().min(1, "Valid until date is required"),
  currency: z.string(),
  discountTotal: z.number().min(0),
  taxRate: z.number().min(0).max(1),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(quotationItemSchema).min(1, "At least one item is required"),
});

export type QuotationCreateInput = z.infer<typeof quotationCreateSchema>;
