import Link from "next/link";
import { findByIdIncludingDeleted } from "@/features/sales-invoice/repositories/invoice.repository";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/features/sales-invoice/constants";
import { InvoiceDetailActions } from "@/components/invoices/invoice-detail-actions";
import { RecordPaymentButton } from "@/components/invoices/record-payment-button";
import { notFound } from "next/navigation";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inv = await findByIdIncludingDeleted(id);
  if (!inv) notFound();

  const isDeleted = !!inv.deletedAt;
  const balance = Number(inv.grandTotal) - Number(inv.paidAmount);

  return (
    <div className="space-y-6">
      <PageHeader title={inv.documentNo} description={inv.customerName} />

      <div className="flex items-center gap-3">
        <Badge variant={
          inv.status === "PAID" ? "default" :
          inv.status === "OVERDUE" || inv.status === "VOIDED" ? "destructive" : "secondary"
        }>
          {STATUS_LABELS[inv.status] ?? inv.status}
        </Badge>
        <span className="text-lg font-bold">₱{Number(inv.grandTotal).toLocaleString()}</span>
        {balance > 0 && inv.status !== "VOIDED" && (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Outstanding: ₱{balance.toLocaleString()}
        </Badge>
        )}
        {isDeleted && <Badge variant="destructive">Deleted</Badge>}
      </div>

      <InvoiceDetailActions invId={id} status={inv.status} isDeleted={isDeleted} />

      {!isDeleted && ["OPEN", "PARTIALLY_PAID", "OVERDUE"].includes(inv.status) && (
        <RecordPaymentButton invoiceId={id} />
      )}

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Invoice Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Invoice #</span><span className="font-mono text-xs">{inv.documentNo}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Customer</span>{inv.customer ? <Link href={`/customers/${inv.customer.id}`} className="text-primary hover:underline">{inv.customerName}</Link> : inv.customerName}</div>
            {inv.customerEmail && <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{inv.customerEmail}</span></div>}
            {inv.customerPhone && <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{inv.customerPhone}</span></div>}
            {inv.customerAddress && <div className="flex justify-between gap-4"><span className="shrink-0 text-muted-foreground">Billed To</span><span className="text-right text-xs">{inv.customerAddress}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Sales Order</span>{inv.salesOrder ? <Link href={`/sales-orders/${inv.salesOrder.id}`} className="text-primary hover:underline">{inv.salesOrder.documentNo}</Link> : "—"}</div>
            <div className="flex justify-between"><span className="text-muted-foreground">Issue Date</span><span>{new Date(inv.issueDate).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span className={inv.status === "OVERDUE" ? "font-medium text-red-600" : ""}>{new Date(inv.dueDate).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created By</span><span>{inv.createdBy?.name ?? "—"}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Financial Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₱{Number(inv.subtotal).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-red-600">-₱{Number(inv.discountTotal).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">VAT ({(Number(inv.taxRate) * 100).toFixed(1)}%)</span><span>₱{Number(inv.taxTotal).toLocaleString()}</span></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Grand Total</span><span>₱{Number(inv.grandTotal).toLocaleString()}</span></div>
            <div className="flex justify-between text-green-600"><span className="font-medium">Paid</span><span className="font-medium">₱{Number(inv.paidAmount).toLocaleString()}</span></div>
            {inv.paidAt && (
              <div className="flex justify-between text-xs text-muted-foreground"><span>Last Payment Received</span><span>{new Date(inv.paidAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}</span></div>
            )}
            {balance > 0 && inv.status !== "VOIDED" && (
              <div className="flex justify-between border-t border-border pt-2 text-red-600"><span className="font-bold">Outstanding Balance</span><span className="font-bold">₱{balance.toLocaleString()}</span></div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="border-b border-border"><tr>
              <th className="pb-2 text-left">Description</th>
              <th className="pb-2 text-right">Qty</th>
              <th className="pb-2 text-right">Unit Price</th>
              <th className="pb-2 text-right">Disc %</th>
              <th className="pb-2 text-right">Line Total</th>
            </tr></thead>
            <tbody>
              {inv.items.map((item) => (
                <tr key={item.id} className="border-b border-border">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-right">{Number(item.quantity)}</td>
                  <td className="py-2 text-right">₱{Number(item.unitPrice).toLocaleString()}</td>
                  <td className="py-2 text-right">{Number(item.discountPercent)}%</td>
                  <td className="py-2 text-right font-medium">₱{Number(item.lineTotal).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {inv.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap text-sm">{inv.notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
