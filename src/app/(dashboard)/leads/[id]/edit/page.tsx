import { prisma } from "@/lib/prisma";
import { findByIdIncludingDeleted } from "@/features/lead/repositories/lead.repository";
import { LeadEditForm } from "@/components/leads/lead-edit-form";
import { PageHeader } from "@/components/page-header";
import { notFound } from "next/navigation";

export default async function EditLeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await findByIdIncludingDeleted(id);

  if (!lead || lead.deletedAt) notFound();

  const users = await prisma.user.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Lead" description={lead.documentNo} />
      <LeadEditForm
        lead={{
          id: lead.id,
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          jobTitle: lead.jobTitle,
          source: lead.source,
          assignedToId: lead.assignedToId,
          notes: lead.notes,
        }}
        users={users}
      />
    </div>
  );
}
