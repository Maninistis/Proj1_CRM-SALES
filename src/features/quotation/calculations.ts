function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calcLineTotal(
  quantity: number,
  unitPrice: number,
  discountPercent: number
): number {
  const lineTotal = quantity * unitPrice * (1 - discountPercent / 100);
  return round2(lineTotal);
}

export function calcSubtotal(
  items: { quantity: number; unitPrice: number; discountPercent: number }[]
): number {
  const sum = items.reduce(
    (acc, item) => acc + calcLineTotal(item.quantity, item.unitPrice, item.discountPercent),
    0
  );
  return round2(sum);
}

export function calcTax(
  subtotal: number,
  discountTotal: number,
  taxRate: number
): number {
  const taxable = Math.max(0, subtotal - discountTotal);
  return round2(taxable * taxRate);
}

export function calcGrandTotal(
  subtotal: number,
  discountTotal: number,
  taxTotal: number
): number {
  return round2(subtotal - discountTotal + taxTotal);
}

export type ComputedTotals = {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  lineTotals: number[];
};

export function computeAllTotals(
  items: { quantity: number; unitPrice: number; discountPercent: number }[],
  discountTotal: number,
  taxRate: number
): ComputedTotals {
  const lineTotals = items.map((item) =>
    calcLineTotal(item.quantity, item.unitPrice, item.discountPercent)
  );
  const subtotal = round2(lineTotals.reduce((a, b) => a + b, 0));
  const taxTotal = calcTax(subtotal, discountTotal, taxRate);
  const grandTotal = calcGrandTotal(subtotal, discountTotal, taxTotal);

  return {
    subtotal,
    discountTotal: round2(discountTotal),
    taxTotal,
    grandTotal,
    lineTotals,
  };
}
