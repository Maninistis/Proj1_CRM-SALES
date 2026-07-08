"use client";

import { convertQuotationAction } from "@/features/sales-order/actions/so-actions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

type CustomerOption = { id: string; name: string };

export function ConvertQuotationToSOButton({
  quotationId,
  customers,
}: {
  quotationId: string;
  customers: CustomerOption[];
}) {
  const [show, setShow] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [error, setError] = useState("");

  async function handleConvert() {
    if (!customerId) { setError("Please select a customer"); return; }
    const result = await convertQuotationAction(quotationId, customerId);
    if (!result.success) setError(result.error || "Failed");
  }

  if (!show) {
    return (
      <Button onClick={() => setShow(true)} size="sm">
        <ShoppingCart className="mr-2 h-4 w-4" /> Convert to Sales Order
      </Button>
    );
  }

  return (
    <Card className="max-w-md border-primary/30">
      <CardHeader><CardTitle className="text-base">Convert to Sales Order</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Select Customer *</label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            value={customerId}
            onChange={(e) => { setCustomerId(e.target.value); setError(""); }}
          >
            <option value="">Select a customer</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={handleConvert} size="sm">Convert</Button>
          <Button onClick={() => setShow(false)} variant="outline" size="sm">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}
