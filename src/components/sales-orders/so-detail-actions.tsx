"use client";

import { deleteSOAction, restoreSOAction, transitionSOAction } from "@/features/sales-order/actions/so-actions";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, X } from "lucide-react";

type Props = { soId: string; status: string; isDeleted: boolean };

export function SODetailActions({ soId, status, isDeleted }: Props) {
  if (isDeleted) {
    return (
      <form action={async () => { await restoreSOAction(soId); }}>
        <Button type="submit" variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> Restore</Button>
      </form>
    );
  }

  const canCancel =
    status === "AWAITING_PAYMENT" ||
    status === "PARTIALLY_PAID" ||
    status === "FULLY_PAID";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canCancel && (
        <form action={async () => { await transitionSOAction(soId, "CANCELLED"); }}>
          <Button type="submit" variant="outline" size="sm" className="text-red-600"><X className="mr-2 h-4 w-4" /> Cancel Order</Button>
        </form>
      )}
      <form action={async () => { await deleteSOAction(soId); }}>
        <Button type="submit" variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
      </form>
    </div>
  );
}

