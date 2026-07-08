import Link from "next/link";
import { soQuerySchema } from "@/features/sales-order/schemas/so-query";
import { list as listSOs } from "@/features/sales-order/services/so.service";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { SOTable } from "@/components/sales-orders/so-table";
import { STATUS_OPTIONS } from "@/features/sales-order/constants";

export default async function SalesOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = soQuerySchema.parse({
    page: params.page || 1,
    pageSize: params.pageSize || 20,
    search: params.search,
    status: params.status,
    deleted: params.deleted || "false",
  });

  const { data, total } = await listSOs({
    page: query.page, pageSize: query.pageSize,
    search: query.search, status: query.status,
    deleted: query.deleted === "true",
  });

  const totalPages = Math.ceil(total / query.pageSize);
  const isDeletedView = query.deleted === "true";

  const serializableData = data.map((so) => ({
    id: so.id, documentNo: so.documentNo,
    customer: so.customer ? { name: so.customer.name } : null,
    status: so.status, grandTotal: so.grandTotal.toString(),
    orderDate: so.orderDate.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title={isDeletedView ? "Deleted Sales Orders" : "Sales Orders"} description={isDeletedView ? "Restore deleted orders" : "Manage customer sales orders"}>
        {!isDeletedView && <Link href="/sales-orders/new" className={buttonVariants()}>New Sales Order</Link>}
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        {!isDeletedView && STATUS_OPTIONS.map((opt) => {
          const isActive = query.status === opt.value;
          const url = new URLSearchParams();
          url.set("page", "1");
          if (!isActive) url.set("status", opt.value);
          if (query.search) url.set("search", query.search);
          return <Link key={opt.value} href={`?${url.toString()}`} className={`rounded-md border px-3 py-1 text-sm ${isActive ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>{opt.label}</Link>;
        })}
        <Link href={isDeletedView ? "/sales-orders" : "/sales-orders?deleted=true"} className="ml-auto rounded-md border border-border px-3 py-1 text-sm hover:bg-muted">
          {isDeletedView ? "← Back" : "View Deleted"}
        </Link>
      </div>

      <SOTable data={serializableData} page={query.page} pageSize={query.pageSize} total={total} totalPages={totalPages} search={query.search} />
    </div>
  );
}
