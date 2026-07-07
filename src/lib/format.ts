export function formatCurrency(amount: number | string, currency = "PHP"): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return `₱${num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatNumber(amount: number | string): string {
  const num = typeof amount === "string" ? Number(amount) : amount;
  return num.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
