export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  ACKNOWLEDGED: "Acknowledged",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-800",
  DISPATCHED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  ACKNOWLEDGED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export const STATUS_OPTIONS = Object.entries({
  DRAFT: "Draft",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  ACKNOWLEDGED: "Acknowledged",
  CANCELLED: "Cancelled",
}).map(([value, label]) => ({ value, label }));
