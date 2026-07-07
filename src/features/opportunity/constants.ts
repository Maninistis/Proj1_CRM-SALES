import { OPPORTUNITY_STAGES, OPPORTUNITY_STATUSES } from "./types";

export const STAGE_LABELS: Record<string, string> = {
  PROSPECTING: "Prospecting",
  QUALIFICATION: "Qualification",
  NEEDS_ANALYSIS: "Needs Analysis",
  VALUE_PROPOSITION: "Value Proposition",
  NEGOTIATION: "Negotiation",
};

export const STAGE_COLORS: Record<string, string> = {
  PROSPECTING: "bg-blue-100 text-blue-800",
  QUALIFICATION: "bg-cyan-100 text-cyan-800",
  NEEDS_ANALYSIS: "bg-yellow-100 text-yellow-800",
  VALUE_PROPOSITION: "bg-orange-100 text-orange-800",
  NEGOTIATION: "bg-purple-100 text-purple-800",
};

export const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

export const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-800",
  CLOSED_WON: "bg-green-100 text-green-800",
  CLOSED_LOST: "bg-red-100 text-red-800",
};

export const STAGE_OPTIONS = Object.entries(OPPORTUNITY_STAGES).map(
  ([value, label]) => ({
    value,
    label: STAGE_LABELS[label] ?? label,
  })
);

export const STATUS_OPTIONS = Object.entries(OPPORTUNITY_STATUSES).map(
  ([value, label]) => ({
    value,
    label: STATUS_LABELS[label] ?? label,
  })
);
