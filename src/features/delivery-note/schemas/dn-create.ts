import { z } from "zod";

export const dnItemSchema = z.object({
  salesOrderItemId: z.string().min(1),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be > 0"),
});

export const dnCreateSchema = z.object({
  salesOrderId: z.string().min(1, "Sales Order is required"),
  deliveryDate: z.string().optional().or(z.literal("")),
  carrier: z.string().optional().or(z.literal("")),
  trackingNumber: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(dnItemSchema).min(1, "At least one item is required"),
});

export type DNCreateInput = z.infer<typeof dnCreateSchema>;
