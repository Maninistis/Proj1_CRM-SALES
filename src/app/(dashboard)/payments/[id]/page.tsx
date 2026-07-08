import Link from "next/link";
import { findByIdIncludingDeleted } from "@/features/payment/repositories/payment.repository";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, METHOD_LABELS } from "@/features/payment/constants";
import { PaymentDetailActions } from "@/components/payments/payment-detail-actions";
import { notFound } from "next/navigation";

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payment = await findByIdIncludingDeleted(id);
  if (!payment) notFound();

  const isDeleted = !!payment.deletedAt;

  return (
    <div className="space-y-6">
      <PageHeader title={payment.documentNo} description={payment.customerName} />

      <div className="flex items-center gap-3">
        <Badge variant={payment.status === "RECEIVED" ? "default" : payment.status === "FAILED" || payment.status === "CANCELLED" ? "destructive" : "secondary"}>
          {STATUS_LABELS[payment.status] ?? payment.status}
        </Badge>
        <span className="text-lg font-bold text-green-600">₱{Number(payment.amount).toLocaleString()}</span>
        {isDeleted && <Badge variant="destructive">Deleted</Badge>}
      </div>

      <PaymentDetailActions paymentId={id} invoiceId={payment.salesInvoiceId} isDeleted={isDeleted} />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Payment #</span><span className="font-mono text-xs">{payment.documentNo}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium text-green-600">₱{Number(payment.amount).toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span>{METHOD_LABELS[payment.paymentMethod] ?? payment.paymentMethod}</span></div>
            {payment.referenceNumber && <div className="flex justify-between"><span className="text-muted-foreground">Reference #</span><span className="font-mono text-xs">{payment.referenceNumber}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Payment Date</span><span>{new Date(payment.paymentDate).toLocaleDateString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Invoice</span>{payment.salesInvoice ? <Link href={`/sales-invoices/${payment.salesInvoice.id}`} className="text-primary hover:underline">{payment.salesInvoice.documentNo}</Link> : "—"}</div>
            <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><Link href={`/customers/${payment.customerId}`} className="text-primary hover:underline">{payment.customerName}</Link></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Received By</span><span>{payment.receivedBy?.name ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Recorded</span><span>{new Date(payment.createdAt).toLocaleString()}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Invoice Summary</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {payment.salesInvoice ? (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">Invoice Total</span><span>₱{Number(payment.salesInvoice.grandTotal).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">This Payment</span><span className="text-green-600">₱{Number(payment.amount).toLocaleString()}</span></div>
                <div className="flex justify-between border-t border-border pt-2"><span className="font-medium">Invoice Status</span><Badge variant="secondary">{payment.salesInvoice.status}</Badge></div>
              </>
            ) : <p className="text-muted-foreground">Invoice not found.</p>}
          </CardContent>
        </Card>
      </div>

      {payment.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap text-sm">{payment.notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
