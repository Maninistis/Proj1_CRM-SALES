/**
 * Invoice lifecycle (financial state only).
 *
 *   OPEN → PARTIALLY_PAID → PAID
 *
 * Terminal states: OVERDUE (set by notification scan when dueDate < now),
 * VOIDED (manual action by manager/admin).
 *
 * Invoice statuses NEVER represent operational fulfillment — that is the
 * Sales Order's job. See `.omo/plans/lifecycle-refactor.md`.
 */

export const INVOICE_STATUSES = {
  OPEN: "OPEN",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  VOIDED: "VOIDED",
} as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[keyof typeof INVOICE_STATUSES];

export const INVOICE_TRANSITIONS: Record<string, string[]> = {
  OPEN: ["PARTIALLY_PAID", "PAID", "OVERDUE", "VOIDED"],
  PARTIALLY_PAID: ["PAID", "OVERDUE", "VOIDED"],
  PAID: [],
  OVERDUE: ["PARTIALLY_PAID", "PAID", "VOIDED"],
  VOIDED: [],
};

export function isValidTransition(from: string, to: string): boolean {
  const allowed = INVOICE_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}
