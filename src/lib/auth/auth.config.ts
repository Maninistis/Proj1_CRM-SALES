import type { NextAuthConfig } from "next-auth";

/**
 * Auth.js configuration shared between edge (middleware) and node (server).
 *
 * This file MUST NOT import Prisma or any Node-only modules — it runs
 * in the edge runtime for middleware. The credentials provider's
 * `authorize` function (which needs DB access) is added in `auth.ts`.
 *
 * The `jwt` callback copies data from the `user` object (returned by
 * `authorize`) into the token on initial sign-in. Subsequent calls
 * (in middleware) just return the existing token — no DB access.
 *
 * Route protection (auth + permissions) is handled by src/middleware.ts.
 */

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [], // Added in auth.ts (credentials provider needs DB access)
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in: user is the return value of authorize()
      if (user) {
        token.userId = user.id as string;
        token.roleId = (user as { roleId?: string }).roleId as string;
        token.permissions = (
          user as { permissions?: string[] }
        ).permissions as string[];
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.userId = token.userId as string;
        session.user.roleId = token.roleId as string;
        session.user.permissions = token.permissions as string[];
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
