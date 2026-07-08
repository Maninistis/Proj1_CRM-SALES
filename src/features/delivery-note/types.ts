export const DN_STATUSES = {
  DRAFT: "DRAFT",
  DISPATCHED: "DISPATCHED",
  DELIVERED: "DELIVERED",
  ACKNOWLEDGED: "ACKNOWLEDGED",
  CANCELLED: "CANCELLED",
} as const;

export type DNStatus = (typeof DN_STATUSES)[keyof typeof DN_STATUSES];

export const DN_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["DISPATCHED", "CANCELLED"],
  DISPATCHED: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["ACKNOWLEDGED"],
  ACKNOWLEDGED: [],
  CANCELLED: [],
};

export function isValidTransition(from: string, to: string): boolean {
  const allowed = DN_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}
