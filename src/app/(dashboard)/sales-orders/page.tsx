import Link from "next/link";
import { soQuerySchema } from "@/features/sales-order/schemas/so-query";
import { list as listSOs } from "@/features/sales-order/services/so.service";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { SOTable } from "@/components/sales-orders/so-table";
import { STATUS_OPTIONS } from "@/features/sales-order/constants";
import { cn } from "@/lib/utils";

const LEGACY_STATUS_MAP: Record<string, string> = {
  DRAFT: "AWAITING_PAYMENT",
  PENDING: "AWAITING_PAYMENT",
  CONFIRMED: "AWAITING_PAYMENT",
  FULFILLING: "PARTIALLY_PAID",
  INVOICED: "AWAITING_PAYMENT",
};

export default async function SalesOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawStatus = typeof params.status === "string" ? params.status : undefined;
  const normalizedStatus = rawStatus ? LEGACY_STATUS_MAP[rawStatus] ?? rawStatus : undefined;
  const query = soQuerySchema.parse({
    page: params.page || 1, pageSize: params.pageSize || 20,
    search: params.search, status: normalizedStatus, deleted: params.deleted || "false",
  });

  const { data, total } = await listSOs({
    page: query.page, pageSize: query.pageSize,
    search: query.search, status: query.status, deleted: query.deleted === "true",
  });

  const totalPages = Math.ceil(total / query.pageSize);
  const isDeletedView = query.deleted === "true";

  const serializableData = data.map((so) => ({
    id: so.id, documentNo: so.documentNo,
    customer: so.customer ? { name: so.customer.name } : null,
    status: so.status, grandTotal: so.grandTotal.toString(),
    orderDate: so.orderDate.toISOString(),
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
      <PageHeader title={isDeletedView ? "Deleted Sales Orders" : "Sales Orders"} description={isDeletedView ? "Restore deleted orders" : "Manage customer sales orders"}>
        <div className="flex items-center gap-2">
          {!isDeletedView && <Link href="/sales-orders/new" className={buttonVariants()}>New Sales Order</Link>}
          <Link href={isDeletedView ? "/sales-orders" : "/sales-orders?deleted=true"} className={buttonVariants({ variant: "outline" })}>
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

      <SOTable data={serializableData} page={query.page} pageSize={query.pageSize} total={total} totalPages={totalPages} search={query.search} />
    </div>
  );
}
