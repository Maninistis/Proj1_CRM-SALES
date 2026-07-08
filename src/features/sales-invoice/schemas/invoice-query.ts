import { z } from "zod";

export const invoiceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["DRAFT", "OPEN", "PARTIALLY_PAID", "PAID", "OVERDUE", "VOIDED"]).optional(),
  deleted: z.enum(["true", "false"]).default("false"),
});

export type InvoiceQueryInput = z.infer<typeof invoiceQuerySchema>;
