export const OPPORTUNITY_STAGES = {
  PROSPECTING: "PROSPECTING",
  QUALIFICATION: "QUALIFICATION",
  NEEDS_ANALYSIS: "NEEDS_ANALYSIS",
  VALUE_PROPOSITION: "VALUE_PROPOSITION",
  NEGOTIATION: "NEGOTIATION",
} as const;

export type OpportunityStage =
  (typeof OPPORTUNITY_STAGES)[keyof typeof OPPORTUNITY_STAGES];

export const OPPORTUNITY_STATUSES = {
  OPEN: "OPEN",
  CLOSED_WON: "CLOSED_WON",
  CLOSED_LOST: "CLOSED_LOST",
} as const;

export type OpportunityStatus =
  (typeof OPPORTUNITY_STATUSES)[keyof typeof OPPORTUNITY_STATUSES];

const STAGE_ORDER = [
  "PROSPECTING",
  "QUALIFICATION",
  "NEEDS_ANALYSIS",
  "VALUE_PROPOSITION",
  "NEGOTIATION",
];

export function isValidStageTransition(from: string, to: string): boolean {
  const fromIdx = STAGE_ORDER.indexOf(from);
  const toIdx = STAGE_ORDER.indexOf(to);
  return fromIdx >= 0 && toIdx >= 0 && toIdx === fromIdx + 1;
}

export function canCloseWon(stage: string, status: string): boolean {
  return stage === "NEGOTIATION" && status === "OPEN";
}

export function canCloseLost(status: string): boolean {
  return status === "OPEN";
}

export function canReopen(status: string): boolean {
  return status === "CLOSED_LOST";
}

export function getNextStage(currentStage: string): string | null {
  const idx = STAGE_ORDER.indexOf(currentStage);
  if (idx < 0 || idx >= STAGE_ORDER.length - 1) return null;
  return STAGE_ORDER[idx + 1];
}
