import { prisma } from "@/lib/prisma";
import { OpportunityForm } from "@/components/opportunities/opportunity-form";
import { PageHeader } from "@/components/page-header";

export default async function NewOpportunityPage() {
  const [leads, users] = await Promise.all([
    prisma.lead.findMany({
      where: { deletedAt: null, status: "QUALIFIED" },
      select: { id: true, firstName: true, lastName: true, documentNo: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const leadOptions = leads.map((l) => ({
    id: l.id,
    label: `${l.firstName} ${l.lastName} (${l.documentNo})`,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="New Opportunity" description="Create a new sales opportunity from a qualified lead" />
      <OpportunityForm leads={leadOptions} users={users} />
    </div>
  );
}
