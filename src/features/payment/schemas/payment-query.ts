import { z } from "zod";

export const paymentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(["PENDING", "RECEIVED", "FAILED", "CANCELLED", "RECONCILED"]).optional(),
  method: z.enum(["CASH", "BANK_TRANSFER", "CHECK", "CREDIT_CARD", "GCASH", "OTHER"]).optional(),
  deleted: z.enum(["true", "false"]).default("false"),
});

export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
