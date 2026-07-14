import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FileText } from "lucide-react";

export function GenerateInvoiceButton({ soId }: { soId: string }) {
  return (
    <Link href={`/sales-invoices/new?so=${soId}`} className={buttonVariants({ variant: "default", size: "sm" })}>
      <FileText className="mr-2 h-4 w-4" /> Create Invoice
    </Link>
  );
}
