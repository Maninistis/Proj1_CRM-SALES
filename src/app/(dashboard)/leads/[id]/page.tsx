import Link from "next/link";
import { getById as getLead } from "@/features/lead/services/lead.service";
import { findByIdIncludingDeleted } from "@/features/lead/repositories/lead.repository";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from "@/features/lead/constants";
import { LeadDetailActions } from "@/components/leads/lead-detail-actions";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const lead = await findByIdIncludingDeleted(id);
  if (!lead) notFound();

  const isDeleted = !!lead.deletedAt;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${lead.firstName} ${lead.lastName}`}
        description={lead.documentNo}
      >
        {!isDeleted && (
          <Link href={`/leads/${id}/edit`} className={buttonVariants({ variant: "outline" })}>
            Edit
          </Link>
        )}
      </PageHeader>

      <div className="flex items-center gap-3">
        <Badge className={LEAD_STATUS_LABELS[lead.status] ? "" : ""} variant="secondary">
          {LEAD_STATUS_LABELS[lead.status] ?? lead.status}
        </Badge>
        {isDeleted && (
          <Badge variant="destructive">
            Deleted {lead.deletedAt && new Date(lead.deletedAt).toLocaleDateString()}
          </Badge>
        )}
      </div>

      <LeadDetailActions leadId={id} status={lead.status} isDeleted={isDeleted} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{lead.email || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{lead.phone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Company</span>
              <span>{lead.company || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Job Title</span>
              <span>{lead.jobTitle || "—"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lead #</span>
              <span className="font-mono text-xs">{lead.documentNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source</span>
              <span>{LEAD_SOURCE_LABELS[lead.source] ?? lead.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span>{LEAD_STATUS_LABELS[lead.status] ?? lead.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assigned To</span>
              <span>{lead.assignedTo?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created By</span>
              <span>{lead.createdBy?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(lead.createdAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {lead.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{lead.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
