import { prisma } from "@/lib/prisma";
import { CustomerForm } from "@/components/customers/customer-form";
import { PageHeader } from "@/components/page-header";
import { mapLeadToCustomer } from "@/lib/workflow/mappers";
import { ReturnToPipeline, pipelineUrl } from "@/components/pipeline/return-to-pipeline";

export default async function NewCustomerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const leadId = params.leadId as string | undefined;

  const lead = leadId
    ? await prisma.lead.findUnique({
        where: { id: leadId, deletedAt: null },
        select: { id: true, firstName: true, lastName: true, company: true, email: true, phone: true, documentNo: true },
      })
    : null;

  const prefill = lead ? mapLeadToCustomer(lead) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader title="New Customer" description="Add a new customer to your database" />
      <CustomerForm prefill={prefill} />
      {(() => {
        const href = pipelineUrl({ leadId });
        return href && <ReturnToPipeline href={href} />;
      })()}
    </div>
  );
}
