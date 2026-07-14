"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { deleteInvoiceAction, restoreInvoiceAction, transitionInvoiceAction } from "@/features/sales-invoice/actions/invoice-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Trash2, RotateCcw } from "lucide-react";

type Props = { invId: string; status: string; isDeleted: boolean };

export function InvoiceDetailActions({ invId, status, isDeleted }: Props) {
  if (isDeleted) {
    return (
      <form action={async () => { await restoreInvoiceAction(invId); }}>
        <Button type="submit" variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> Restore</Button>
      </form>
    );
  }

  const canRecordPayment = status === "OPEN" || status === "PARTIALLY_PAID" || status === "OVERDUE";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "DRAFT" && (
        <form action={async () => { await transitionInvoiceAction(invId, "OPEN"); }}>
          <Button type="submit" size="sm">Issue Invoice</Button>
        </form>
      )}
      {canRecordPayment && (
        <Link
          href={`/payments/new?inv=${invId}`}
          className={cn(buttonVariants({ size: "sm" }), "border-transparent bg-[#DF853A] text-white hover:bg-[#C76E26]")}
        >
          Record Payment
        </Link>
      )}
      <form action={async () => { await deleteInvoiceAction(invId); }}>
        <Button type="submit" variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
      </form>
    </div>
  );
}
