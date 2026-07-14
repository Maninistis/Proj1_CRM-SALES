"use client";

import Link from "next/link";
import { deletePaymentAction, restorePaymentAction } from "@/features/payment/actions/payment-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Trash2, RotateCcw } from "lucide-react";

type Props = {
  paymentId: string;
  invoiceId: string;
  isDeleted: boolean;
  canDeliver?: boolean;
  salesOrderId?: string;
};

export function PaymentDetailActions({ paymentId, invoiceId, isDeleted, canDeliver, salesOrderId }: Props) {
  if (isDeleted) {
    return (
      <form action={async () => { await restorePaymentAction(paymentId); }}>
        <Button type="submit" variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> Restore</Button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canDeliver && salesOrderId && (
        <Link href={`/delivery-notes/new?so=${salesOrderId}`} className={buttonVariants({ variant: "default", size: "sm" })}>
          Create Delivery Note
        </Link>
      )}
      <form action={async () => { await deletePaymentAction(paymentId, invoiceId); }}>
        <Button type="submit" variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
      </form>
    </div>
  );
}
