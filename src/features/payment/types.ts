export const PAYMENT_STATUSES = {
  PENDING: "PENDING",
  RECEIVED: "RECEIVED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  RECONCILED: "RECONCILED",
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export const PAYMENT_METHODS = {
  CASH: "CASH",
  BANK_TRANSFER: "BANK_TRANSFER",
  CHECK: "CHECK",
  CREDIT_CARD: "CREDIT_CARD",
  GCASH: "GCASH",
  OTHER: "OTHER",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];

export const PAYMENT_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["RECEIVED", "FAILED", "CANCELLED"],
  RECEIVED: ["RECONCILED"],
  FAILED: ["PENDING"],
  CANCELLED: [],
  RECONCILED: [],
};

export function isValidTransition(from: string, to: string): boolean {
  const allowed = PAYMENT_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}
