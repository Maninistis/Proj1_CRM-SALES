import { z } from "zod";

export const userUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Enter a valid email").optional(),
  roleRoleId: z.string().min(1, "Role is required").optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
