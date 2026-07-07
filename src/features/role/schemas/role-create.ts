import { z } from "zod";

export const roleCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  permissionIds: z.array(z.string()),
});

export type RoleCreateInput = z.infer<typeof roleCreateSchema>;
