import { z } from "zod";

export const roleUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  permissionIds: z.array(z.string()).optional(),
});

export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;
