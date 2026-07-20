import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { verifyCredentials, extractPermissions } from "@/features/user/services/auth.service";
import { loginSchema } from "@/features/user/schemas/login-schema";

const nextAuthInstance = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        try {
          const user = await verifyCredentials(email, password);
          const permissions = extractPermissions(user);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            roleId: user.roleRoleId,
            permissions,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
});

export const { handlers, signIn, signOut } = nextAuthInstance;

export async function auth() {
  const session = await nextAuthInstance.auth();
  if (!session?.user) return session;

  const cookieStore = await cookies();
  const businessId = cookieStore.get("businessId")?.value ?? null;

  return {
    ...session,
    user: { ...session.user, businessId },
  };
}
