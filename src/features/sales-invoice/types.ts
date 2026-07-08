export const INVOICE_STATUSES = {
  DRAFT: "DRAFT",
  OPEN: "OPEN",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  VOIDED: "VOIDED",
} as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[keyof typeof INVOICE_STATUSES];

export const INVOICE_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["OPEN", "VOIDED"],
  OPEN: ["PARTIALLY_PAID", "PAID", "OVERDUE", "VOIDED"],
  PARTIALLY_PAID: ["PAID", "OVERDUE"],
  PAID: [],
  OVERDUE: ["PARTIALLY_PAID", "PAID", "VOIDED"],
  VOIDED: [],
};

export function isValidTransition(from: string, to: string): boolean {
  const allowed = INVOICE_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}
