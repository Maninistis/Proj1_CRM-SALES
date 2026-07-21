import { assertOwnership } from "@/lib/auth/owner-check";
import Link from "next/link";
import { findByIdIncludingDeleted } from "@/features/sales-order/repositories/so.repository";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { STATUS_LABELS } from "@/features/sales-order/constants";
import { SODetailActions } from "@/components/sales-orders/so-detail-actions";
import { GenerateInvoiceButton } from "@/components/invoices/generate-invoice-button";
import { ReturnToPipeline, pipelineUrl } from "@/components/pipeline/return-to-pipeline";
import { checkPaymentBeforeDelivery } from "@/lib/workflow/delivery-policy";
import { notFound } from "next/navigation";
import { Truck } from "lucide-react";

export default async function SODetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const so = await findByIdIncludingDeleted(id);
  if (!so) notFound();
await assertOwnership(so);

  const isDeleted = !!so.deletedAt;

  const deliveryCheck = !isDeleted && so.invoice
    ? await checkPaymentBeforeDelivery(id)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader title={so.documentNo} description={so.customer?.name ?? "Unknown customer"}>
        {!isDeleted && so.status === "AWAITING_PAYMENT" && (
          <Link href={`/sales-orders/${id}/edit`} className={buttonVariants({ variant: "outline" })}>Edit</Link>
        )}
      </PageHeader>

      <div className="flex items-center gap-3">
        <Badge variant={so.status === "CANCELLED" ? "destructive" : so.status === "COMPLETED" || so.status === "DELIVERED" ? "default" : "secondary"}>
          {STATUS_LABELS[so.status] ?? so.status}
        </Badge>
        <span className="text-lg font-bold">₱{Number(so.grandTotal).toLocaleString()}</span>
        {isDeleted && <Badge variant="destructive">Deleted</Badge>}
      </div>

      <SODetailActions soId={id} status={so.status} isDeleted={isDeleted} />

      {!isDeleted && !so.invoice && so.status === "AWAITING_PAYMENT" && (
        <GenerateInvoiceButton soId={id} />
      )}

      {!isDeleted && so.invoice && (
        <Link href={`/sales-invoices/${so.invoice.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          View Invoice ({so.invoice.documentNo})
        </Link>
      )}

      {deliveryCheck && deliveryCheck.canDeliver && (
        <Link href={`/delivery-notes/new?so=${id}`} className={buttonVariants({ variant: "default", size: "sm" })}>
          <Truck className="mr-2 h-4 w-4" /> Create Delivery Note
        </Link>
      )}

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Order Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Customer</span>{so.customer ? <Link href={`/customers/${so.customer.id}`} className="text-primary hover:underline">{so.customer.name}</Link> : "—"}</div>
            {so.quotation && <div className="flex justify-between"><span className="text-muted-foreground">From Quotation</span><Link href={`/quotations/${so.quotation.id}`} className="text-primary hover:underline">{so.quotation.documentNo}</Link></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Order Date</span><span>{new Date(so.orderDate).toLocaleDateString()}</span></div>
            {so.expectedDeliveryDate && <div className="flex justify-between"><span className="text-muted-foreground">Expected Delivery</span><span>{new Date(so.expectedDeliveryDate).toLocaleDateString()}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Created By</span><span>{so.createdBy?.name ?? "—"}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Totals</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₱{Number(so.subtotal).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-red-600">-₱{Number(so.discountTotal).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">VAT ({(Number(so.taxRate) * 100).toFixed(1)}%)</span><span>₱{Number(so.taxTotal).toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Grand Total</span><span>₱{Number(so.grandTotal).toLocaleString()}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b border-border">
              <tr>
                <th className="pb-2 text-left">Description</th>
                <th className="pb-2 text-right">Qty</th>
                <th className="pb-2 text-right">Unit Price</th>
                <th className="pb-2 text-right">Disc %</th>
                <th className="pb-2 text-right">Delivered</th>
                <th className="pb-2 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {so.items.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right">{Number(item.quantity)}</td>
                  <td className="py-2 text-right">₱{Number(item.unitPrice).toLocaleString()}</td>
                  <td className="py-2 text-right">{Number(item.discountPercent)}%</td>
                  <td className="py-2 text-right text-muted-foreground">{Number(item.deliveredQuantity)} / {Number(item.quantity)}</td>
                  <td className="py-2 text-right font-medium">₱{Number(item.lineTotal).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {so.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap text-sm">{so.notes}</p></CardContent>
        </Card>
      )}

      {pipelineUrl({ customerId: so.customer?.id }) && (
        <ReturnToPipeline href={pipelineUrl({ customerId: so.customer?.id })!} />
      )}
    </div>
  );
}
