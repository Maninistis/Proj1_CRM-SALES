import { LEAD_STATUSES, LEAD_SOURCES } from "./types";

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  DISQUALIFIED: "Disqualified",
};

export const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800 border-blue-200",
  CONTACTED: "bg-yellow-100 text-yellow-800 border-yellow-200",
  QUALIFIED: "bg-green-100 text-green-800 border-green-200",
  DISQUALIFIED: "bg-red-100 text-red-800 border-red-200",
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  WEBSITE: "Website",
  REFERRAL: "Referral",
  COLD_CALL: "Cold Call",
  EVENT: "Event",
  OTHER: "Other",
};

export const LEAD_SOURCE_OPTIONS = Object.entries(LEAD_SOURCES).map(([value, label]) => ({
  value,
  label: LEAD_SOURCE_LABELS[label] ?? label,
}));

export const LEAD_STATUS_OPTIONS = Object.entries(LEAD_STATUSES).map(([value, label]) => ({
  value,
  label: LEAD_STATUS_LABELS[label] ?? label,
}));
