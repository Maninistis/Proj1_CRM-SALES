import Link from "next/link";
import { dnQuerySchema } from "@/features/delivery-note/schemas/dn-query";
import { list as listDNs } from "@/features/delivery-note/services/dn.service";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { DNTable } from "@/components/delivery-notes/dn-table";
import { STATUS_OPTIONS } from "@/features/delivery-note/constants";

export default async function DeliveryNotesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = dnQuerySchema.parse({
    page: params.page || 1,
    pageSize: params.pageSize || 20,
    search: params.search,
    status: params.status,
    deleted: params.deleted || "false",
  });

  const { data, total } = await listDNs({
    page: query.page, pageSize: query.pageSize,
    search: query.search, status: query.status,
    deleted: query.deleted === "true",
  });

  const totalPages = Math.ceil(total / query.pageSize);
  const isDeletedView = query.deleted === "true";

  const serializableData = data.map((dn) => ({
    id: dn.id, documentNo: dn.documentNo, status: dn.status,
    deliveryDate: dn.deliveryDate?.toISOString() ?? null,
    salesOrder: dn.salesOrder ? {
      documentNo: dn.salesOrder.documentNo,
      customer: dn.salesOrder.customer ? { name: dn.salesOrder.customer.name } : null,
    } : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title={isDeletedView ? "Deleted Delivery Notes" : "Delivery Notes"} description={isDeletedView ? "Restore deleted notes" : "Manage deliveries from sales orders"}>
        {!isDeletedView && (
          <Link href="/sales-orders" className={buttonVariants({ variant: "outline" })}>Create from Sales Order</Link>
        )}
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
        <Link href={isDeletedView ? "/delivery-notes" : "/delivery-notes?deleted=true"} className="ml-auto rounded-md border border-border px-3 py-1 text-sm hover:bg-muted">
          {isDeletedView ? "← Back" : "View Deleted"}
        </Link>
      </div>

      <DNTable data={serializableData} page={query.page} pageSize={query.pageSize} total={total} totalPages={totalPages} search={query.search} />
    </div>
  );
}
