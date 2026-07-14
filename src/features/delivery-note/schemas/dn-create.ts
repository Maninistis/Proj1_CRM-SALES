import { z } from "zod";

export const dnItemSchema = z.object({
  salesOrderItemId: z.string().min(1),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be > 0"),
});

export const dnCreateSchema = z.object({
  salesOrderId: z.string().min(1, "Sales Order is required"),
  deliveryDate: z.string().min(1, "Delivery date is required"),
  carrier: z.string().min(1, "Carrier is required"),
  trackingNumber: z.string().min(1, "Tracking number is required"),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(dnItemSchema).min(1, "At least one item is required"),
});

export type DNCreateInput = z.infer<typeof dnCreateSchema>;
