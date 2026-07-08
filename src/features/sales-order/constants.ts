export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  FULFILLING: "Fulfilling",
  DELIVERED: "Delivered",
  INVOICED: "Invoiced",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-100 text-zinc-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  FULFILLING: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-cyan-100 text-cyan-800",
  INVOICED: "bg-orange-100 text-orange-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export const STATUS_OPTIONS = Object.entries({
  DRAFT: "Draft",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  FULFILLING: "Fulfilling",
  DELIVERED: "Delivered",
  INVOICED: "Invoiced",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}).map(([value, label]) => ({ value, label }));
