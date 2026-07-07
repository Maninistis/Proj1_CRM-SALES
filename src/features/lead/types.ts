export const LEAD_STATUSES = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  QUALIFIED: "QUALIFIED",
  DISQUALIFIED: "DISQUALIFIED",
} as const;

export type LeadStatus = (typeof LEAD_STATUSES)[keyof typeof LEAD_STATUSES];

export const LEAD_SOURCES = {
  WEBSITE: "WEBSITE",
  REFERRAL: "REFERRAL",
  COLD_CALL: "COLD_CALL",
  EVENT: "EVENT",
  OTHER: "OTHER",
} as const;

export type LeadSource = (typeof LEAD_SOURCES)[keyof typeof LEAD_SOURCES];

export const LEAD_TRANSITIONS: Record<string, string[]> = {
  NEW: ["CONTACTED", "QUALIFIED", "DISQUALIFIED"],
  CONTACTED: ["QUALIFIED", "DISQUALIFIED"],
  QUALIFIED: [],
  DISQUALIFIED: [],
};

export function isValidTransition(from: string, to: string): boolean {
  const allowed = LEAD_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}
