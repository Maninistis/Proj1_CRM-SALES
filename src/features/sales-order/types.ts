export const SALES_ORDER_STATUSES = {
  DRAFT: "DRAFT",
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  FULFILLING: "FULFILLING",
  DELIVERED: "DELIVERED",
  INVOICED: "INVOICED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type SalesOrderStatus =
  (typeof SALES_ORDER_STATUSES)[keyof typeof SALES_ORDER_STATUSES];

export const SO_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PENDING", "CANCELLED"],
  PENDING: ["CONFIRMED", "DRAFT", "CANCELLED"],
  CONFIRMED: ["CANCELLED"],
  FULFILLING: [],
  DELIVERED: [],
  INVOICED: [],
  COMPLETED: [],
  CANCELLED: [],
};

export function isValidTransition(from: string, to: string): boolean {
  const allowed = SO_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

export function isActiveStatus(status: string): boolean {
  return ["DRAFT", "PENDING", "CONFIRMED", "FULFILLING", "DELIVERED", "INVOICED"].includes(status);
}
