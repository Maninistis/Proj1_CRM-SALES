import { z } from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().min(1, "Phone number is required"),
  image: z.string().optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  roleRoleId: z.string().min(1, "Role is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  managerId: z.string().optional().or(z.literal("")),
  requirePasswordChange: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
