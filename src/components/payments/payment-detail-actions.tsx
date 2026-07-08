"use client";

import { deletePaymentAction, restorePaymentAction } from "@/features/payment/actions/payment-actions";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw } from "lucide-react";

type Props = { paymentId: string; invoiceId: string; isDeleted: boolean };

export function PaymentDetailActions({ paymentId, invoiceId, isDeleted }: Props) {
  if (isDeleted) {
    return (
      <form action={async () => { await restorePaymentAction(paymentId); }}>
        <Button type="submit" variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> Restore</Button>
      </form>
    );
  }

  return (
    <form action={async () => { await deletePaymentAction(paymentId, invoiceId); }}>
      <Button type="submit" variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
    </form>
  );
}
