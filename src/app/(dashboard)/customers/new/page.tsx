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
  const quotationId = params.quotationId as string | undefined;
  const returnTo = params.returnTo as string | undefined;

  const quotation = quotationId
    ? await prisma.quotation.findUnique({
        where: { id: quotationId, deletedAt: null },
        select: {
          id: true,
          documentNo: true,
          opportunity: {
            select: {
              leadId: true,
              lead: {
                select: {
                  id: true, firstName: true, lastName: true, company: true,
                  email: true, phone: true, documentNo: true,
                },
              },
            },
          },
        },
      })
    : null;

  const resolvedLeadId = quotation?.opportunity?.lead?.id ?? leadId ?? null;
  const lead = resolvedLeadId
    ? await prisma.lead.findUnique({
        where: { id: resolvedLeadId, deletedAt: null },
        select: { id: true, firstName: true, lastName: true, company: true, email: true, phone: true, documentNo: true },
      })
    : null;

  const prefill = lead ? mapLeadToCustomer(lead) : undefined;
  const sourceLabel = quotation
    ? `Quotation #${quotation.documentNo}`
    : prefill?.sourceLabel;

  return (
    <div className="space-y-6">
      <PageHeader title="New Customer" description="Add a new customer to your database" />
      <CustomerForm
        prefill={prefill ? { ...prefill, sourceLabel } : undefined}
        returnTo={returnTo}
      />
      {(() => {
        const href = pipelineUrl({ leadId: resolvedLeadId });
        return href && <ReturnToPipeline href={href} />;
      })()}
    </div>
  );
}
