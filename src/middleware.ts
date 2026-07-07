import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { ROUTE_PERMISSIONS, hasPermission, PUBLIC_ROUTES } from "@/lib/auth/permissions";

/**
 * Next.js middleware — runs on every request (edge runtime).
 *
 * Creates a separate NextAuth instance from authConfig (no Prisma adapter,
 * no credentials provider) to verify the JWT and check permissions.
 *
 * Flow:
 *   1. Public routes (/login, /register, /api/auth/*) → allow
 *   2. No session → redirect to /login
 *   3. Route has a permission requirement → check user permissions
 *   4. User lacks permission → redirect to /dashboard
 *   5. All checks pass → allow
 */

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const pathname = nextUrl.pathname;

  // 1. Allow public routes
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isAuthApi = pathname.startsWith("/api/auth");

  if (isPublicRoute || isAuthApi) {
    // If logged in and visiting /login, redirect to dashboard
    if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return;
  }

  // 2. Not logged in → redirect to login
  if (!isLoggedIn) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  // 3. Check route permission
  const permissions = req.auth?.user?.permissions ?? [];
  for (const [routePrefix, requiredPermission] of Object.entries(
    ROUTE_PERMISSIONS
  )) {
    if (pathname === routePrefix || pathname.startsWith(`${routePrefix}/`)) {
      if (!hasPermission(permissions, requiredPermission)) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      break;
    }
  }

  // 5. All checks pass
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
