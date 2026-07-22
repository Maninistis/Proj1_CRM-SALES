import { assertOwnership } from "@/lib/auth/owner-check";
import Link from "next/link";
import { findByIdIncludingDeleted } from "@/features/delivery-note/repositories/dn.repository";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/features/delivery-note/constants";
import { DNDetailActions } from "@/components/delivery-notes/dn-detail-actions";
import { ReturnToPipeline, pipelineUrl } from "@/components/pipeline/return-to-pipeline";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function DNDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dn = await findByIdIncludingDeleted(id);
  if (!dn) notFound();
await assertOwnership(dn);

  const isDeleted = !!dn.deletedAt;

  const payment = dn.salesOrder
    ? await prisma.payment.findFirst({
        where: { salesInvoice: { salesOrderId: dn.salesOrder.id }, deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: { id: true, documentNo: true },
      })
    : null;

  return (
    <div className="space-y-6">
      <PageHeader title={dn.documentNo} description={dn.salesOrder?.customer?.name ?? "Unknown"} />

      <div className="flex items-center gap-3">
        <Badge variant={dn.status === "CANCELLED" ? "destructive" : dn.status === "DELIVERED" || dn.status === "ACKNOWLEDGED" ? "default" : "secondary"}>
          {STATUS_LABELS[dn.status] ?? dn.status}
        </Badge>
        {isDeleted && <Badge variant="destructive">Deleted</Badge>}
      </div>

      <DNDetailActions dnId={id} status={dn.status} isDeleted={isDeleted} />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Delivery Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">DN #</span><span className="font-mono text-xs">{dn.documentNo}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Payment Record</span>{payment ? <Link href={`/payments/${payment.id}`} className="text-primary hover:underline">{payment.documentNo}</Link> : "—"}</div>
            <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span>{dn.salesOrder?.customer?.name ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Carrier</span><span>{dn.carrier || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tracking #</span><span className="font-mono text-xs">{dn.trackingNumber || "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery Date</span><span>{dn.deliveryDate ? new Date(dn.deliveryDate).toLocaleDateString() : "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Prepared By</span><span>{dn.createdBy?.name ?? "—"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(dn.createdAt).toLocaleString()}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Delivered Items</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="pb-2 text-left">Description</th>
                  <th className="pb-2 text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {dn.items.map((item) => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="py-2">{item.description}</td>
                    <td className="py-2 text-right font-medium">{Number(item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {dn.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent><p className="whitespace-pre-wrap text-sm">{dn.notes}</p></CardContent>
        </Card>
      )}

      {pipelineUrl({ customerId: dn.salesOrder?.customer?.id }) && (
        <ReturnToPipeline href={pipelineUrl({ customerId: dn.salesOrder?.customer?.id })!} />
      )}
    </div>
  );
}
