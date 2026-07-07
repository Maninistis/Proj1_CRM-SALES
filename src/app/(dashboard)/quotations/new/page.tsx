import { prisma } from "@/lib/prisma";
import { QuotationForm } from "@/components/quotations/quotation-form";
import { PageHeader } from "@/components/page-header";

export default async function NewQuotationPage() {
  const [opportunities, taxSetting, products] = await Promise.all([
    prisma.opportunity.findMany({
      where: { deletedAt: null, status: "CLOSED_WON" },
      select: { id: true, title: true, documentNo: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.setting.findUnique({ where: { key: "tax_rate" } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, defaultPrice: true, category: true },
      orderBy: { name: "asc" },
    }),
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

  return (
    <div className="space-y-6">
      <PageHeader title="New Quotation" description="Create a quotation from a won opportunity" />
      <QuotationForm opportunities={oppOptions} defaultTaxRate={defaultTaxRate} catalog={catalog} />
    </div>
  );
}
