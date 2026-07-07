import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

/**
 * Server Action helper: throws ForbiddenError if the user lacks the permission.
 *
 * Usage in Server Actions:
 *   const session = await auth();
 *   if (!session) throw new UnauthorizedError();
 *   requirePermission(session, "leads:create");
 */
export function requirePermission(
  session: { user?: { permissions?: string[] } } | null,
  permission: string
) {
  if (!session?.user?.permissions) {
    throw new UnauthorizedError();
  }

  if (!hasPermission(session.user.permissions, permission)) {
    throw new ForbiddenError(`Requires permission: ${permission}`);
  }
}
