import { prisma } from "@/lib/prisma";
import { findByIdIncludingDeleted } from "@/features/opportunity/repositories/opportunity.repository";
import { OpportunityEditForm } from "@/components/opportunities/opportunity-edit-form";
import { PageHeader } from "@/components/page-header";
import { notFound } from "next/navigation";

export default async function EditOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opp = await findByIdIncludingDeleted(id);

  if (!opp || opp.deletedAt) notFound();

  const users = await prisma.user.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Opportunity" description={opp.documentNo} />
      <OpportunityEditForm
        opp={{
          id: opp.id,
          title: opp.title,
          description: opp.description,
          estimatedValue: opp.estimatedValue.toString(),
          expectedCloseDate: opp.expectedCloseDate.toISOString(),
          stage: opp.stage,
          assignedToId: opp.assignedToId,
          lossReason: opp.lossReason,
        }}
        users={users}
      />
    </div>
  );
}
