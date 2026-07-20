import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { getScopeUserId } from "@/lib/auth/data-scope";
import { SOForm } from "@/components/sales-orders/so-form";
import { PageHeader } from "@/components/page-header";
import { mapQuotationToSalesOrder } from "@/lib/workflow/mappers";
import { ReturnToPipeline, pipelineUrl } from "@/components/pipeline/return-to-pipeline";

export default async function NewSOPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const quotationId = params.quotationId as string | undefined;

  const session = await auth();
  const scopeUserId = getScopeUserId(session!.user.permissions, session!.user.userId);

  const [customers, taxSetting, products, quotation] = await Promise.all([
    prisma.customer.findMany({
      where: { businessId: session!.user.businessId ?? "", deletedAt: null, status: "ACTIVE", ...(scopeUserId ? { createdById: scopeUserId } : {}) },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.setting.findUnique({ where: { key_businessId: { key: "tax_rate", businessId: session!.user.businessId ?? "" } } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, defaultPrice: true, category: true },
      orderBy: { name: "asc" },
    }),
    quotationId
      ? prisma.quotation.findUnique({
          where: { id: quotationId, deletedAt: null },
          include: {
            items: { where: { deletedAt: null } },
            opportunity: { include: { lead: true } },
          },
        })
      : Promise.resolve(null),
  ]);

  const defaultTaxRate = taxSetting ? Number(taxSetting.value) : 0.12;
  const catalog = products.map((p) => ({ id: p.id, name: p.name, defaultPrice: Number(p.defaultPrice), category: p.category }));

  const activeCustomer = quotation?.opportunity?.lead
    ? await prisma.customer.findFirst({
        where: { leadId: quotation.opportunity.lead.id, deletedAt: null },
        select: { id: true, name: true },
      })
    : null;

  const resolvedCustomer = activeCustomer;

  const prefill = quotation
    ? {
        ...mapQuotationToSalesOrder({
          id: quotation.id,
          documentNo: quotation.documentNo,
          discountTotal: Number(quotation.discountTotal),
          taxRate: Number(quotation.taxRate),
          notes: quotation.notes,
          items: quotation.items.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            discountPercent: Number(item.discountPercent),
          })),
        }),
        customerId: resolvedCustomer?.id ?? "",
      }
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader title="New Sales Order" description="Create a sales order for an active customer" />
      <SOForm customers={customers} defaultTaxRate={defaultTaxRate} catalog={catalog} prefill={prefill} />
      {(() => {
        const href = pipelineUrl({ customerId: resolvedCustomer?.id, leadId: quotation?.opportunity?.leadId });
        return href && <ReturnToPipeline href={href} />;
      })()}
    </div>
  );
}
