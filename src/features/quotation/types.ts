export const QUOTATION_STATUSES = {
  DRAFT: "DRAFT",
  READY: "READY",
  SENT: "SENT",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
} as const;

export type QuotationStatus =
  (typeof QUOTATION_STATUSES)[keyof typeof QUOTATION_STATUSES];

export const QUOTATION_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["READY", "SENT"],
  READY: ["DRAFT", "SENT"],
  SENT: ["ACCEPTED", "REJECTED", "EXPIRED"],
  REJECTED: ["DRAFT"],
  EXPIRED: ["DRAFT"],
  ACCEPTED: [],
};

export function isValidTransition(from: string, to: string): boolean {
  const allowed = QUOTATION_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}
