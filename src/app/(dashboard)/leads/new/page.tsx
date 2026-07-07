import { prisma } from "@/lib/prisma";
import { LeadForm } from "@/components/leads/lead-form";
import { PageHeader } from "@/components/page-header";

export default async function NewLeadPage() {
  const users = await prisma.user.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="New Lead" description="Create a new sales lead" />
      <LeadForm users={users} />
    </div>
  );
}
