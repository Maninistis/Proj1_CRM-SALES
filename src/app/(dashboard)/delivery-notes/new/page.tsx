import { prisma } from "@/lib/prisma";
import { findByIdIncludingDeleted } from "@/features/sales-order/repositories/so.repository";
import { DNForm } from "@/components/delivery-notes/dn-form";
import { PageHeader } from "@/components/page-header";
import { checkPaymentBeforeDelivery } from "@/lib/workflow/delivery-policy";
import { ReturnToPipeline, pipelineUrl } from "@/components/pipeline/return-to-pipeline";
import { notFound } from "next/navigation";
import { ShieldAlert } from "lucide-react";

export default async function NewDNPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const salesOrderId = (params.so as string) || (params.salesOrderId as string);

  if (!salesOrderId) {
    return (
      <div className="space-y-6">
        <PageHeader title="New Delivery Note" description="Select a sales order to create a delivery note" />
        <p className="text-sm text-muted-foreground">Delivery notes are created after payment requirements are met. Go to a paid sales order and click "Create Delivery Note".</p>
      </div>
    );
  }

  const [so, paymentCheck] = await Promise.all([
    findByIdIncludingDeleted(salesOrderId),
    checkPaymentBeforeDelivery(salesOrderId),
  ]);
  if (!so || so.deletedAt) notFound();

  if (!paymentCheck.canDeliver) {
    return (
      <div className="space-y-6">
        <PageHeader title="New Delivery Note" description={`From ${so.documentNo} — ${so.customer?.name}`} />
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-5">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-900">Payment Required Before Delivery</p>
            <p className="mt-1 text-sm text-amber-800">{paymentCheck.reason}</p>
            <div className="mt-3 flex gap-4 text-sm text-amber-700">
              <span>Paid: <strong>₱{paymentCheck.paidAmount.toLocaleString()}</strong></span>
              <span>Total: <strong>₱{paymentCheck.invoiceTotal.toLocaleString()}</strong></span>
              <span>Coverage: <strong>{paymentCheck.paidPercentage.toFixed(1)}%</strong></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const soItems = so.items.map((i) => ({
    id: i.id,
    description: i.description,
    quantity: i.quantity.toString(),
    unitPrice: i.unitPrice.toString(),
    deliveredQuantity: i.deliveredQuantity.toString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="New Delivery Note" description={`From ${so.documentNo} — ${so.customer?.name}`} />
      <DNForm salesOrderId={so.id} soDocumentNo={so.documentNo} soItems={soItems} />
      {pipelineUrl({ customerId: so.customer?.id }) && (
        <ReturnToPipeline href={pipelineUrl({ customerId: so.customer?.id })!} />
      )}
    </div>
  );
}
