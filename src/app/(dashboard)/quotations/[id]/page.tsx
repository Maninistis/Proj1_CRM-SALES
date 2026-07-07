import Link from "next/link";
import { getById as getQuotation } from "@/features/quotation/services/quotation.service";
import { findByIdIncludingDeleted } from "@/features/quotation/repositories/quotation.repository";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { STATUS_LABELS } from "@/features/quotation/constants";
import { QuotationDetailActions } from "@/components/quotations/quotation-detail-actions";
import { notFound } from "next/navigation";

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await findByIdIncludingDeleted(id);
  if (!quote) notFound();

  const isDeleted = !!quote.deletedAt;

  return (
    <div className="space-y-6">
      <PageHeader title={quote.subject} description={quote.documentNo}>
        {!isDeleted && (quote.status === "DRAFT" || quote.status === "READY") && (
          <Link href={`/quotations/${id}/edit`} className={buttonVariants({ variant: "outline" })}>
            Edit
          </Link>
        )}
      </PageHeader>

      <div className="flex items-center gap-3">
        <Badge variant="secondary">{STATUS_LABELS[quote.status] ?? quote.status}</Badge>
        <span className="text-lg font-bold">
          {quote.currency} {Number(quote.grandTotal).toLocaleString()}
        </span>
        {isDeleted && <Badge variant="destructive">Deleted</Badge>}
      </div>

      <QuotationDetailActions quoteId={id} status={quote.status} isDeleted={isDeleted} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quote #</span>
              <span className="font-mono text-xs">{quote.documentNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opportunity</span>
              {quote.opportunity ? (
                <Link href={`/opportunities/${quote.opportunity.id}`} className="text-primary hover:underline">
                  {quote.opportunity.title}
                </Link>
              ) : "—"}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valid Until</span>
              <span>{new Date(quote.validUntil).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Currency</span>
              <span>{quote.currency}</span>
            </div>
            {quote.sentAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sent</span>
                <span>{new Date(quote.sentAt).toLocaleString()}</span>
              </div>
            )}
            {quote.acceptedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Accepted</span>
                <span>{new Date(quote.acceptedAt).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created By</span>
              <span>{quote.createdBy?.name ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Totals</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₱{Number(quote.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-red-600">-₱{Number(quote.discountTotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax Rate</span>
              <span>{(Number(quote.taxRate) * 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax Total</span>
              <span>₱{Number(quote.taxTotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <span>Grand Total</span>
              <span>₱{Number(quote.grandTotal).toLocaleString()}</span>
            </div>
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
                <th className="pb-2 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item) => (
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

      {quote.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap text-sm">{quote.notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
