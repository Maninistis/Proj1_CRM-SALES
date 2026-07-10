import Link from "next/link";
import { dnQuerySchema } from "@/features/delivery-note/schemas/dn-query";
import { list as listDNs } from "@/features/delivery-note/services/dn.service";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { DNTable } from "@/components/delivery-notes/dn-table";
import { STATUS_OPTIONS } from "@/features/delivery-note/constants";
import { cn } from "@/lib/utils";

export default async function DeliveryNotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = dnQuerySchema.parse({
    page: params.page || 1, pageSize: params.pageSize || 20,
    search: params.search, status: params.status, deleted: params.deleted || "false",
  });

  const { data, total } = await listDNs({
    page: query.page, pageSize: query.pageSize,
    search: query.search, status: query.status, deleted: query.deleted === "true",
  });

  const totalPages = Math.ceil(total / query.pageSize);
  const isDeletedView = query.deleted === "true";

  const serializableData = data.map((dn) => ({
    id: dn.id, documentNo: dn.documentNo, status: dn.status,
    deliveryDate: dn.deliveryDate?.toISOString() ?? null,
    salesOrder: dn.salesOrder ? { documentNo: dn.salesOrder.documentNo, customer: dn.salesOrder.customer ? { name: dn.salesOrder.customer.name } : null } : null,
  }));

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const url = new URLSearchParams();
    url.set("page", "1");
    const merged = { search: query.search, status: query.status, deleted: query.deleted, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) url.set(k, v);
    return `?${url.toString()}`;
  };

  const chipClass = (isActive: boolean) =>
    cn("rounded-md border px-3 py-1 text-sm transition-colors",
      isActive ? "border-[#103447] bg-[#103447] text-[#F1EBE3]" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader title={isDeletedView ? "Deleted Delivery Notes" : "Delivery Notes"} description={isDeletedView ? "Restore deleted notes" : "Manage deliveries from sales orders"}>
        <div className="flex items-center gap-2">
          {!isDeletedView && <Link href="/sales-orders" className={buttonVariants({ variant: "outline" })}>Create from Sales Order</Link>}
          <Link href={isDeletedView ? "/delivery-notes" : "/delivery-notes?deleted=true"} className={buttonVariants({ variant: "outline" })}>
            {isDeletedView ? "Back" : "View Deleted"}
          </Link>
        </div>
      </PageHeader>

      {!isDeletedView && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
          <div className="flex flex-wrap gap-2">
            <Link href={buildUrl({ status: undefined })} className={chipClass(!query.status)}>All</Link>
            {STATUS_OPTIONS.map((opt) => (
              <Link key={opt.value} href={buildUrl({ status: query.status === opt.value ? undefined : opt.value })} className={chipClass(query.status === opt.value)}>
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <DNTable data={serializableData} page={query.page} pageSize={query.pageSize} total={total} totalPages={totalPages} search={query.search} />
    </div>
  );
}
