import { z } from "zod";

export const paymentCreateSchema = z.object({
  salesInvoiceId: z.string().min(1, "Invoice is required"),
  amount: z.number().min(0.01, "Amount must be greater than zero"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHECK", "CREDIT_CARD", "GCASH", "OTHER"]),
  referenceNumber: z.string().optional().or(z.literal("")),
  paymentDate: z.string().min(1, "Payment date is required"),
  notes: z.string().optional().or(z.literal("")),
});

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
