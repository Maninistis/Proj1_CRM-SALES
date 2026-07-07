import { prisma } from "@/lib/prisma";
import { findByIdIncludingDeleted } from "@/features/quotation/repositories/quotation.repository";
import { QuotationEditForm } from "@/components/quotations/quotation-edit-form";
import { PageHeader } from "@/components/page-header";
import { notFound } from "next/navigation";

export default async function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quote, products] = await Promise.all([
    findByIdIncludingDeleted(id),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, defaultPrice: true, category: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!quote || quote.deletedAt) notFound();
  if (quote.status !== "DRAFT" && quote.status !== "READY") {
    notFound();
  }

  const dateStr = quote.validUntil.toISOString().split("T")[0];

  const catalog = products.map((p) => ({
    id: p.id,
    name: p.name,
    defaultPrice: Number(p.defaultPrice),
    category: p.category,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Quotation" description={quote.documentNo} />
      <QuotationEditForm
        quote={{
          id: quote.id,
          subject: quote.subject,
          validUntil: dateStr,
          discountTotal: Number(quote.discountTotal),
          taxRate: Number(quote.taxRate),
          notes: quote.notes ?? "",
          items: quote.items.map((i) => ({
            id: i.id,
            description: i.description,
            quantity: Number(i.quantity),
            unitPrice: Number(i.unitPrice),
            discountPercent: Number(i.discountPercent),
          })),
        }}
        catalog={catalog}
      />
    </div>
  );
}
