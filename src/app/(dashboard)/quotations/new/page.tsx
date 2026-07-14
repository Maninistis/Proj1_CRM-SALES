import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { getScopeUserId } from "@/lib/auth/data-scope";
import { QuotationForm } from "@/components/quotations/quotation-form";
import { PageHeader } from "@/components/page-header";
import { mapOpportunityToQuotation } from "@/lib/workflow/mappers";
import { ReturnToPipeline, pipelineUrl } from "@/components/pipeline/return-to-pipeline";

export default async function NewQuotationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const opportunityId = params.opportunityId as string | undefined;

  const session = await auth();
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);

  const [opportunities, taxSetting, products, opportunity] = await Promise.all([
    prisma.opportunity.findMany({
      where: { deletedAt: null, status: "CLOSED_WON", ...(scopeUserId ? { OR: [{ assignedToId: scopeUserId }, { createdById: scopeUserId }] } : {}) },
      select: { id: true, title: true, documentNo: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.setting.findUnique({ where: { key: "tax_rate" } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, defaultPrice: true, category: true },
      orderBy: { name: "asc" },
    }),
    opportunityId
      ? prisma.opportunity.findUnique({
          where: { id: opportunityId, deletedAt: null },
          select: { id: true, title: true, expectedCloseDate: true, description: true, documentNo: true, leadId: true },
        })
      : Promise.resolve(null),
  ]);

  const oppOptions = opportunities.map((o) => ({
    id: o.id,
    label: `${o.title} (${o.documentNo})`,
  }));

  const defaultTaxRate = taxSetting ? Number(taxSetting.value) : 0;

  const catalog = products.map((p) => ({
    id: p.id,
    name: p.name,
    defaultPrice: Number(p.defaultPrice),
    category: p.category,
  }));

  const prefill = opportunity ? mapOpportunityToQuotation(opportunity) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader title="New Quotation" description="Create a quotation from a won opportunity" />
      <QuotationForm opportunities={oppOptions} defaultTaxRate={defaultTaxRate} catalog={catalog} prefill={prefill} />
      {opportunity && (() => {
        const href = pipelineUrl({ leadId: opportunity.leadId });
        return href && <ReturnToPipeline href={href} />;
      })()}
    </div>
  );
}
