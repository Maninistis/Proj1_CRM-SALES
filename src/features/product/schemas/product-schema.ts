import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().or(z.literal("")),
  defaultPrice: z.number().min(0, "Price must be >= 0"),
  category: z.string().min(1, "Category is required"),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;

export const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().or(z.literal("")),
  defaultPrice: z.number().min(0).optional(),
  category: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
