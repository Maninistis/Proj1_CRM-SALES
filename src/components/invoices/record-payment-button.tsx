"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export function RecordPaymentButton({ invoiceId }: { invoiceId: string }) {
  return (
    <Link href={`/payments/new?inv=${invoiceId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
      <Wallet className="mr-2 h-4 w-4" /> Record Payment
    </Link>
  );
}
