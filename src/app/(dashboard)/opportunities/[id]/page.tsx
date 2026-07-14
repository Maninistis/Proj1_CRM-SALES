import { assertOwnership } from "@/lib/auth/owner-check";
import Link from "next/link";
import { getById as getOpportunity } from "@/features/opportunity/services/opportunity.service";
import { findByIdIncludingDeleted } from "@/features/opportunity/repositories/opportunity.repository";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { STAGE_LABELS, STATUS_LABELS } from "@/features/opportunity/constants";
import { OpportunityDetailActions } from "@/components/opportunities/opportunity-detail-actions";
import { LeadConvertForm } from "@/components/opportunities/lead-convert-form";
import { findByIdIncludingDeleted as findLeadIncludingDeleted } from "@/features/lead/repositories/lead.repository";
import { findByLeadId } from "@/features/opportunity/repositories/opportunity.repository";
import { ReturnToPipeline, pipelineUrl } from "@/components/pipeline/return-to-pipeline";
import { FileText } from "lucide-react";
import { notFound } from "next/navigation";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opp = await findByIdIncludingDeleted(id);
  if (!opp) notFound();
await assertOwnership(opp);

  const isDeleted = !!opp.deletedAt;
  const pipelineHref = pipelineUrl({ leadId: opp.lead.id });

  return (
    <div className="space-y-6">
      <PageHeader title={opp.title} description={opp.documentNo}>
        {!isDeleted && (
          <Link href={`/opportunities/${id}/edit`} className={buttonVariants({ variant: "outline" })}>
            Edit
          </Link>
        )}
      </PageHeader>

      <div className="flex items-center gap-3">
        <Badge variant="secondary">{STAGE_LABELS[opp.stage] ?? opp.stage}</Badge>
        <Badge
          variant={
            opp.status === "CLOSED_WON" ? "default" :
            opp.status === "CLOSED_LOST" ? "destructive" : "secondary"
          }
        >
          {STATUS_LABELS[opp.status] ?? opp.status}
        </Badge>
        {isDeleted && (
          <Badge variant="destructive">
            Deleted {opp.deletedAt && new Date(opp.deletedAt).toLocaleDateString()}
          </Badge>
        )}
      </div>

      <OpportunityDetailActions oppId={id} stage={opp.stage} status={opp.status} isDeleted={isDeleted} />

      {opp.status === "CLOSED_WON" && !isDeleted && (
        <Link href={`/quotations/new?opportunityId=${id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          <FileText className="mr-2 h-4 w-4" /> Create Quotation
        </Link>
      )}

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Opp #</span>
              <span className="font-mono text-xs">{opp.documentNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Value</span>
              <span className="font-medium">₱{Number(opp.estimatedValue).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expected Close</span>
              <span>{new Date(opp.expectedCloseDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stage</span>
              <span>{STAGE_LABELS[opp.stage] ?? opp.stage}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span>{STATUS_LABELS[opp.status] ?? opp.status}</span>
            </div>
            {opp.lossReason && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loss Reason</span>
                <span className="text-destructive">{opp.lossReason}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assigned To</span>
              <span>{opp.assignedTo?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created By</span>
              <span>{opp.createdBy?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(opp.createdAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Lead</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <Link href={`/leads/${opp.lead.id}`} className="text-primary hover:underline">
                {opp.lead.firstName} {opp.lead.lastName}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lead #</span>
              <span className="font-mono text-xs">{opp.lead.documentNo}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {opp.description && (
        <Card>
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{opp.description}</p>
          </CardContent>
        </Card>
      )}

      {pipelineHref && <ReturnToPipeline href={pipelineHref} />}
    </div>
  );
}
