export const STATUS_LABELS: Record<string, string> = {
  AWAITING_PAYMENT: "Awaiting Payment",
  PARTIALLY_PAID: "Partially Paid",
  FULLY_PAID: "Fully Paid",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<string, string> = {
  AWAITING_PAYMENT: "bg-yellow-100 text-yellow-800",
  PARTIALLY_PAID: "bg-blue-100 text-blue-800",
  FULLY_PAID: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export const STATUS_OPTIONS = Object.entries({
  AWAITING_PAYMENT: "Awaiting Payment",
  PARTIALLY_PAID: "Partially Paid",
  FULLY_PAID: "Fully Paid",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}).map(([value, label]) => ({ value, label }));
