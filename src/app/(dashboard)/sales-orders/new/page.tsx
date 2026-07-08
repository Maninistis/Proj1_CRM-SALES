import { prisma } from "@/lib/prisma";
import { SOForm } from "@/components/sales-orders/so-form";
import { PageHeader } from "@/components/page-header";

export default async function NewSOPage() {
  const [customers, taxSetting, products] = await Promise.all([
    prisma.customer.findMany({
      where: { deletedAt: null, status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.setting.findUnique({ where: { key: "tax_rate" } }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, defaultPrice: true, category: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const defaultTaxRate = taxSetting ? Number(taxSetting.value) : 0.12;
  const catalog = products.map((p) => ({ id: p.id, name: p.name, defaultPrice: Number(p.defaultPrice), category: p.category }));

  return (
    <div className="space-y-6">
      <PageHeader title="New Sales Order" description="Create a sales order for an active customer" />
      <SOForm customers={customers} defaultTaxRate={defaultTaxRate} catalog={catalog} />
    </div>
  );
}
