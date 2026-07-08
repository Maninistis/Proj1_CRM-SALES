"use client";

import { deleteInvoiceAction, restoreInvoiceAction, transitionInvoiceAction } from "@/features/sales-invoice/actions/invoice-actions";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, X } from "lucide-react";

type Props = { invId: string; status: string; isDeleted: boolean };

export function InvoiceDetailActions({ invId, status, isDeleted }: Props) {
  if (isDeleted) {
    return (
      <form action={async () => { await restoreInvoiceAction(invId); }}>
        <Button type="submit" variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> Restore</Button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "DRAFT" && (
        <form action={async () => { await transitionInvoiceAction(invId, "OPEN"); }}>
          <Button type="submit" size="sm">Issue Invoice</Button>
        </form>
      )}
      {(status === "DRAFT" || status === "OPEN" || status === "OVERDUE") && (
        <form action={async () => { await transitionInvoiceAction(invId, "VOIDED"); }}>
          <Button type="submit" variant="outline" size="sm" className="text-red-600"><X className="mr-2 h-4 w-4" /> Void</Button>
        </form>
      )}
      <form action={async () => { await deleteInvoiceAction(invId); }}>
        <Button type="submit" variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
      </form>
    </div>
  );
}
