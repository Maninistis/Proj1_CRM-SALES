import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { verifyCredentials, extractPermissions } from "@/features/user/services/auth.service";
import { loginSchema } from "@/features/user/schemas/login-schema";

/**
 * Auth.js v5 instance — used in Server Components, Server Actions,
 * and Route Handlers. Runs in the Node.js runtime (not edge).
 *
 * The credentials provider's `authorize` function queries the database
 * via the service layer and returns the user with permissions.
 * The `jwt` callback (in auth.config.ts) copies these to the token.
 */

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Validate input with Zod
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        try {
          const user = await verifyCredentials(email, password);
          const permissions = extractPermissions(user);

          // Return user object — the jwt callback will copy these to the token
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            roleId: user.roleRoleId,
            permissions,
          };
        } catch {
          // Invalid credentials — return null to trigger the error UI
          return null;
        }
      },
    }),
  ],
});
