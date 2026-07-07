import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleRoleId: z.string().min(1, "Role is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
