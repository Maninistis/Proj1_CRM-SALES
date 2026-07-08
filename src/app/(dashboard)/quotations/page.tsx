import Link from "next/link";
import { quotationQuerySchema } from "@/features/quotation/schemas/quotation-query";
import { list as listQuotations } from "@/features/quotation/services/quotation.service";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { QuotationTable } from "@/components/quotations/quotation-table";
import { STATUS_OPTIONS } from "@/features/quotation/constants";

export default async function QuotationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = quotationQuerySchema.parse({
    page: params.page || 1,
    pageSize: params.pageSize || 20,
    search: params.search,
    status: params.status,
    deleted: params.deleted || "false",
  });

  const { data, total } = await listQuotations({
    page: query.page,
    pageSize: query.pageSize,
    search: query.search,
    status: query.status,
    deleted: query.deleted === "true",
  });

  const totalPages = Math.ceil(total / query.pageSize);

  const serializableData = data.map((q) => ({
    id: q.id,
    documentNo: q.documentNo,
    subject: q.subject,
    status: q.status,
    grandTotal: q.grandTotal.toString(),
    currency: q.currency,
    opportunity: q.opportunity ? { title: q.opportunity.title } : null,
    validUntil: q.validUntil.toISOString(),
    createdAt: q.createdAt.toISOString(),
  }));

  const isDeletedView = query.deleted === "true";

  return (
    <div className="space-y-6">
      <PageHeader
        title={isDeletedView ? "Deleted Quotations" : "Quotations"}
        description={isDeletedView ? "Restore deleted quotations" : "Manage sales quotations"}
      >
        {!isDeletedView && (
          <Link href="/quotations/new" className={buttonVariants()}>New Quotation</Link>
        )}
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        {!isDeletedView && (
          <>
            {STATUS_OPTIONS.map((opt) => {
              const isActive = query.status === opt.value;
              const url = new URLSearchParams();
              url.set("page", "1");
              if (!isActive) url.set("status", opt.value);
              if (query.search) url.set("search", query.search);
              return (
                <Link
                  key={opt.value}
                  href={`?${url.toString()}`}
                  className={`rounded-md border px-3 py-1 text-sm ${isActive ? "bg-[#103447] text-[#F1EBE3] border-[#103447]" : "border-border hover:bg-muted"}`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </>
        )}
        <Link
          href={isDeletedView ? "/quotations" : "/quotations?deleted=true"}
          className="ml-auto rounded-md border border-border px-3 py-1 text-sm hover:bg-muted"
        >
          {isDeletedView ? "← Back" : "View Deleted"}
        </Link>
      </div>

      <QuotationTable
        data={serializableData}
        page={query.page}
        pageSize={query.pageSize}
        total={total}
        totalPages={totalPages}
        search={query.search}
      />
    </div>
  );
}
