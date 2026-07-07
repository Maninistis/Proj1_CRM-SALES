import type { DefaultSession } from "next-auth";

/**
 * Type augmentations for Auth.js v5.
 * Adds userId, roleId, and permissions to the Session, User, and JWT types.
 */

declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      roleId: string;
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    roleId?: string;
    permissions?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    roleId?: string;
    permissions?: string[];
  }
}
