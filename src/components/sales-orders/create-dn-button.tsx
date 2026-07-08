"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Truck } from "lucide-react";

export function CreateDNFromSOButton({ soId }: { soId: string }) {
  return (
    <Link href={`/delivery-notes/new?so=${soId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
      <Truck className="mr-2 h-4 w-4" /> Create Delivery Note
    </Link>
  );
}
