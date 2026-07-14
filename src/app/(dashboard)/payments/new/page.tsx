import { prisma } from "@/lib/prisma";
import { PaymentForm } from "@/components/payments/payment-form";
import { PageHeader } from "@/components/page-header";
import { notFound } from "next/navigation";

export default async function NewPaymentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const invoiceId = (params.inv as string) || (params.invoiceId as string);

  if (!invoiceId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Record Payment" description="Select an open invoice" />
        <p className="text-sm text-muted-foreground">Payments are recorded from an open or partially-paid invoice. Go to an invoice and click "Record Payment".</p>
      </div>
    );
  }

  const invoice = await prisma.salesInvoice.findFirst({
    where: { id: invoiceId, deletedAt: null },
    include: {
      payments: { where: { deletedAt: null, status: "RECEIVED" } },
    },
  });

  if (!invoice) notFound();

  const grandTotal = Number(invoice.grandTotal);
  const alreadyPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Record Payment" description={`For ${invoice.documentNo}`} />
      <PaymentForm
        invoiceId={invoice.id}
        invoiceNo={invoice.documentNo}
        customerName={invoice.customerName}
        grandTotal={grandTotal}
        alreadyPaid={alreadyPaid}
      />
    </div>
  );
}
