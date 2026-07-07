import { z } from "zod";
import { quotationItemSchema } from "./quotation-create";

export const quotationUpdateSchema = z.object({
  subject: z.string().min(1).optional(),
  validUntil: z.string().min(1).optional(),
  discountTotal: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(1).optional(),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(quotationItemSchema).min(1).optional(),
});

export type QuotationUpdateInput = z.infer<typeof quotationUpdateSchema>;
