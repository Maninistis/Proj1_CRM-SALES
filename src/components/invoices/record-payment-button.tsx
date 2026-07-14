"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function RecordPaymentButton({ invoiceId }: { invoiceId: string }) {
  return (
    <Link
      href={`/payments/new?inv=${invoiceId}`}
      className={cn(buttonVariants({ size: "sm" }), "border-transparent bg-[#DF853A] text-white hover:bg-[#C76E26]")}
    >
      Record Payment
    </Link>
  );
}
