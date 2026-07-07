import bcrypt from "bcryptjs";
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateLastLogin,
  type UserWithPermissions,
} from "../repositories/user.repository";
import { NotFoundError, ValidationError, ConflictError } from "@/lib/errors";

const BCRYPT_ROUNDS = 12;

/**
 * Extract permission codes from a user with relations loaded.
 */
export function extractPermissions(user: UserWithPermissions): string[] {
  return user.role.rolePermissions.map((rp) => rp.permission.code);
}

/**
 * Verify email + password against the database.
 * Returns the user with permissions, or throws if invalid.
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<UserWithPermissions> {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ValidationError("Invalid email or password");
  }

  if (user.status !== "ACTIVE") {
    throw new ValidationError("Account is inactive. Contact an administrator.");
  }

  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) {
    throw new ValidationError("Invalid email or password");
  }

  // Update last login timestamp
  await updateLastLogin(user.id);

  return user;
}

/**
 * Register a new user with the default role (Sales Rep).
 */
export async function register(input: {
  email: string;
  name: string;
  password: string;
}): Promise<UserWithPermissions> {
  // Check if email already exists
  const existing = await findUserByEmail(input.email);
  if (existing) {
    throw new ConflictError("Email already registered");
  }

  // Hash password
  const passwordHash = bcrypt.hashSync(input.password, BCRYPT_ROUNDS);

  // Find the default role (Sales Rep)
  const { prisma } = await import("@/lib/prisma");
  const defaultRole = await prisma.role.findUnique({
    where: { name: "Sales Rep" },
  });
  if (!defaultRole) {
    throw new Error("Default role 'Sales Rep' not found. Run the seed first.");
  }

  // Create user
  await createUser({
    email: input.email,
    name: input.name,
    passwordHash,
    roleRoleId: defaultRole.id,
  });

  // Return the created user with relations
  const created = await findUserByEmail(input.email);
  if (!created) {
    throw new Error("Failed to retrieve created user");
  }

  return created;
}

/**
 * Get a user by ID (for session validation).
 */
export async function getUserById(userId: string): Promise<UserWithPermissions> {
  const user = await findUserById(userId);
  if (!user) {
    throw new NotFoundError("User", userId);
  }
  return user;
}
