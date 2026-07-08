"use client";

import { generateFromSOAction } from "@/features/sales-invoice/actions/invoice-actions";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export function GenerateInvoiceButton({ soId }: { soId: string }) {
  return (
    <form action={async () => { await generateFromSOAction(soId); }}>
      <Button type="submit" variant="outline" size="sm">
        <FileText className="mr-2 h-4 w-4" /> Generate Invoice
      </Button>
    </form>
  );
}
