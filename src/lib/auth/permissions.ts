/**
 * Permission definitions and RBAC utilities.
 *
 * Permissions use the format "resource:action" (e.g. "leads:create").
 * The wildcard "*" grants all permissions (Admin only).
 */

// === PERMISSION CODES ===

export const PERMISSIONS = [
  // Wildcard (Admin only — grants all permissions)
  "*",

  // Dashboard
  "dashboard:read",

  // CRM — Leads
  "leads:read",
  "leads:create",
  "leads:update",
  "leads:delete",

  // CRM — Opportunities
  "opportunities:read",
  "opportunities:create",
  "opportunities:update",
  "opportunities:delete",

  // CRM — Quotations
  "quotations:read",
  "quotations:create",
  "quotations:update",
  "quotations:delete",

  // CRM — Customers
  "customers:read",
  "customers:create",
  "customers:update",
  "customers:delete",

  // Sales — Sales Orders
  "sales-orders:read",
  "sales-orders:create",
  "sales-orders:update",
  "sales-orders:delete",

  // Sales — Delivery Notes
  "delivery-notes:read",
  "delivery-notes:create",
  "delivery-notes:update",
  "delivery-notes:delete",

  // Sales — Invoices
  "sales-invoices:read",
  "sales-invoices:create",
  "sales-invoices:update",
  "sales-invoices:delete",

  // Sales — Payments
  "payments:read",
  "payments:create",
  "payments:update",
  "payments:delete",

  // System
  "users:read",
  "users:create",
  "users:update",
  "users:delete",

  "roles:read",
  "roles:create",
  "roles:update",

  "settings:read",
  "settings:update",

  "audit-logs:read",

  // Reports
  "reports:read",
] as const;

// === ROUTE-TO-PERMISSION MAPPING (for middleware) ===

export const ROUTE_PERMISSIONS: Record<string, string> = {
  "/dashboard": "dashboard:read",
  "/pipeline": "leads:read",
  "/leads": "leads:read",
  "/opportunities": "opportunities:read",
  "/quotations": "quotations:read",
  "/customers": "customers:read",
  "/sales-orders": "sales-orders:read",
  "/delivery-notes": "delivery-notes:read",
  "/sales-invoices": "sales-invoices:read",
  "/payments": "payments:read",
  "/users": "users:read",
  "/roles": "roles:read",
  "/settings": "settings:read",
  "/audit-logs": "audit-logs:read",
  "/reports": "reports:read",
};

// === PUBLIC ROUTES (no auth required) ===

export const PUBLIC_ROUTES = ["/login", "/register"];

// === PERMISSION CHECKER ===

export function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  if (userPermissions.includes("*")) return true;
  return userPermissions.includes(requiredPermission);
}

// === ROLE-PERMISSION ASSIGNMENTS (for seeding) ===

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: ["*"],
  "Sales Manager": [
    "dashboard:read",
    "leads:read",
    "leads:create",
    "leads:update",
    "leads:delete",
    "opportunities:read",
    "opportunities:create",
    "opportunities:update",
    "opportunities:delete",
    "quotations:read",
    "quotations:create",
    "quotations:update",
    "quotations:delete",
    "customers:read",
    "customers:create",
    "customers:update",
    "customers:delete",
    "sales-orders:read",
    "sales-orders:create",
    "sales-orders:update",
    "sales-orders:delete",
    "delivery-notes:read",
    "delivery-notes:create",
    "delivery-notes:update",
    "delivery-notes:delete",
    "sales-invoices:read",
    "sales-invoices:create",
    "sales-invoices:update",
    "sales-invoices:delete",
    "payments:read",
    "payments:create",
    "payments:update",
    "payments:delete",
    "reports:read",
  ],
  "Sales Rep": [
    "dashboard:read",
    "leads:read",
    "leads:create",
    "leads:update",
    "opportunities:read",
    "opportunities:create",
    "opportunities:update",
    "quotations:read",
    "quotations:create",
    "quotations:update",
    "customers:read",
    "customers:create",
    "customers:update",
    "sales-orders:read",
  ],
  Accountant: [
    "dashboard:read",
    "sales-invoices:read",
    "sales-invoices:create",
    "sales-invoices:update",
    "payments:read",
    "payments:create",
    "payments:update",
    "customers:read",
    "reports:read",
  ],
};
