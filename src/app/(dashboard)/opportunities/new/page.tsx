import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { getScopeUserId } from "@/lib/auth/data-scope";
import { OpportunityForm } from "@/components/opportunities/opportunity-form";
import { PageHeader } from "@/components/page-header";
import { mapLeadToOpportunity } from "@/lib/workflow/mappers";
import { ReturnToPipeline, pipelineUrl } from "@/components/pipeline/return-to-pipeline";

export default async function NewOpportunityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const leadId = params.leadId as string | undefined;

  const session = await auth();
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);

  const [leads, users, lead] = await Promise.all([
    prisma.lead.findMany({
      where: { deletedAt: null, status: "QUALIFIED", ...(scopeUserId ? { OR: [{ assignedToId: scopeUserId }, { createdById: scopeUserId }] } : {}) },
      select: { id: true, firstName: true, lastName: true, documentNo: true },
      orderBy: { createdAt: "desc" },
    }),
    scopeUserId ? Promise.resolve([]) : prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    leadId
      ? prisma.lead.findUnique({
          where: { id: leadId, deletedAt: null },
          select: { id: true, firstName: true, lastName: true, company: true, assignedToId: true, documentNo: true },
        })
      : Promise.resolve(null),
  ]);

  const leadOptions = leads.map((l) => ({
    id: l.id,
    label: `${l.firstName} ${l.lastName} (${l.documentNo})`,
  }));

  const prefill = lead ? mapLeadToOpportunity(lead) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader title="New Opportunity" description="Create a new sales opportunity from a qualified lead" />
      <OpportunityForm leads={leadOptions} users={users} prefill={prefill} currentUserId={session!.user.userId} canAssign={!scopeUserId} />
      {(() => {
        const href = pipelineUrl({ leadId });
        return href && <ReturnToPipeline href={href} />;
      })()}
    </div>
  );
}
