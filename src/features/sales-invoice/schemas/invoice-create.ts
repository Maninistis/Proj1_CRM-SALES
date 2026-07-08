import { z } from "zod";

export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be > 0"),
  unitPrice: z.number().min(0, "Unit price must be >= 0"),
  discountPercent: z.number().min(0).max(100),
});

export const invoiceCreateSchema = z.object({
  salesOrderId: z.string().min(1, "Sales Order is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  discountTotal: z.number().min(0),
  taxRate: z.number().min(0).max(1),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

export type InvoiceCreateInput = z.infer<typeof invoiceCreateSchema>;
