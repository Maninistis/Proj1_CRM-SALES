export const CUSTOMER_STATUSES = {
  NEW: "NEW",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  BLOCKED: "BLOCKED",
} as const;

export type CustomerStatus =
  (typeof CUSTOMER_STATUSES)[keyof typeof CUSTOMER_STATUSES];

export const CUSTOMER_TRANSITIONS: Record<string, string[]> = {
  NEW: ["ACTIVE", "INACTIVE"],
  ACTIVE: ["INACTIVE", "BLOCKED"],
  INACTIVE: ["ACTIVE"],
  BLOCKED: ["ACTIVE"],
};

export function isValidTransition(from: string, to: string): boolean {
  const allowed = CUSTOMER_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function canCreateSalesOrder(status: string): boolean {
  return status === "ACTIVE";
}
