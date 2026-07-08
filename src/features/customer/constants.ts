export const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BLOCKED: "Blocked",
};

export const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-zinc-100 text-zinc-800",
  BLOCKED: "bg-red-100 text-red-800",
};

export const STATUS_OPTIONS = Object.entries({
  NEW: "New",
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  BLOCKED: "Blocked",
}).map(([value, label]) => ({ value, label }));
