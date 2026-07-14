import { z } from "zod";

export const paymentCreateSchema = z.object({
  salesInvoiceId: z.string().min(1, "Invoice is required"),
  amount: z.number().min(0.01, "Amount must be greater than zero"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CHECK", "CREDIT_CARD", "GCASH", "OTHER"]),
  referenceNumber: z.string().optional().or(z.literal("")),
  paymentDate: z.string().min(1, "Payment date is required"),
  proofImageUrl: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if (data.paymentMethod !== "CASH") {
    if (!data.referenceNumber || data.referenceNumber.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["referenceNumber"],
        message: "Reference number is required for non-cash payments",
      });
    }
    if (!data.proofImageUrl || data.proofImageUrl.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["proofImageUrl"],
        message: "Proof of payment is required for non-cash payments",
      });
    }
  }
});

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;
