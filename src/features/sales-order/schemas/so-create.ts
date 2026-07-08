import { z } from "zod";

export const soItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be > 0"),
  unitPrice: z.number().min(0, "Unit price must be >= 0"),
  discountPercent: z.number().min(0).max(100),
});

export const soCreateSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  quotationId: z.string().optional().or(z.literal("")),
  orderDate: z.string().min(1, "Order date is required"),
  expectedDeliveryDate: z.string().optional().or(z.literal("")),
  discountTotal: z.number().min(0),
  taxRate: z.number().min(0).max(1),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(soItemSchema).min(1, "At least one item is required"),
});

export type SOCreateInput = z.infer<typeof soCreateSchema>;
