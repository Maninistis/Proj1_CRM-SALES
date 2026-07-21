/**
 * Sales Order lifecycle (operational fulfillment).
 *
 *   AWAITING_PAYMENT → PARTIALLY_PAID → FULLY_PAID → DELIVERED → COMPLETED
 *
 * Plus CANCELLED as a non-lifecycle terminal (set via manual cancel action).
 *
 * Statuses are DERIVED from workflow events — never edited directly by users
 * except for the Cancel action. See `.omo/plans/lifecycle-refactor.md` for
 * the canonical state machine.
 */

export const SALES_ORDER_STATUSES = {
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  FULLY_PAID: "FULLY_PAID",
  DELIVERED: "DELIVERED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type SalesOrderStatus =
  (typeof SALES_ORDER_STATUSES)[keyof typeof SALES_ORDER_STATUSES];

/**
 * Allowed manual transitions. Most lifecycle transitions are automated
 * (payment → PARTIALLY_PAID/FULLY_PAID; DN → DELIVERED/COMPLETED). The only
 * manual transition permitted is *Cancel* from a pre-terminal state.
 */
export const SO_TRANSITIONS: Record<string, string[]> = {
  AWAITING_PAYMENT: ["CANCELLED"],
  PARTIALLY_PAID: ["CANCELLED"],
  FULLY_PAID: ["CANCELLED"],
  DELIVERED: [],
  COMPLETED: [],
  CANCELLED: [],
};

export function isValidTransition(from: string, to: string): boolean {
  const allowed = SO_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/** A SO is "active" while it has not reached a terminal state. */
export function isActiveStatus(status: string): boolean {
  return [
    "AWAITING_PAYMENT",
    "PARTIALLY_PAID",
    "FULLY_PAID",
    "DELIVERED",
  ].includes(status);
}
