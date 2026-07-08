import { prisma } from "@/lib/prisma";
import { findByIdIncludingDeleted } from "@/features/sales-order/repositories/so.repository";
import { DNForm } from "@/components/delivery-notes/dn-form";
import { PageHeader } from "@/components/page-header";
import { notFound } from "next/navigation";

export default async function NewDNPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const salesOrderId = params.so as string;

  if (!salesOrderId) {
    return (
      <div className="space-y-6">
        <PageHeader title="New Delivery Note" description="Select a sales order to create a delivery note" />
        <p className="text-sm text-muted-foreground">Delivery notes are created from a Sales Order. Go to a confirmed sales order and click "Create Delivery Note".</p>
      </div>
    );
  }

  const so = await findByIdIncludingDeleted(salesOrderId);
  if (!so || so.deletedAt) notFound();

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
    </div>
  );
}
