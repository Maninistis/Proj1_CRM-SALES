import Link from "next/link";
import { invoiceQuerySchema } from "@/features/sales-invoice/schemas/invoice-query";
import { list as listInvoices } from "@/features/sales-invoice/services/invoice.service";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { InvoiceTable } from "@/components/invoices/invoice-table";
import { STATUS_OPTIONS } from "@/features/sales-invoice/constants";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = invoiceQuerySchema.parse({
    page: params.page || 1,
    pageSize: params.pageSize || 20,
    search: params.search,
    status: params.status,
    deleted: params.deleted || "false",
  });

  const { data, total } = await listInvoices({
    page: query.page, pageSize: query.pageSize,
    search: query.search, status: query.status,
    deleted: query.deleted === "true",
  });

  const totalPages = Math.ceil(total / query.pageSize);
  const isDeletedView = query.deleted === "false" ? false : query.deleted === "true";

  const serializableData = data.map((inv) => ({
    id: inv.id, documentNo: inv.documentNo,
    customer: inv.customer ? { name: inv.customer.name } : null,
    status: inv.status, grandTotal: inv.grandTotal.toString(),
    paidAmount: inv.paidAmount.toString(),
    dueDate: inv.dueDate.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title={isDeletedView ? "Deleted Invoices" : "Invoices"} description={isDeletedView ? "Restore deleted invoices" : "Manage customer invoices"}>
        {!isDeletedView && <Link href="/sales-orders" className={buttonVariants({ variant: "outline" })}>Generate from Sales Order</Link>}
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
        <Link href={isDeletedView ? "/sales-invoices" : "/sales-invoices?deleted=true"} className="ml-auto rounded-md border border-border px-3 py-1 text-sm hover:bg-muted">
          {isDeletedView ? "← Back" : "View Deleted"}
        </Link>
      </div>

      <InvoiceTable data={serializableData} page={query.page} pageSize={query.pageSize} total={total} totalPages={totalPages} search={query.search} />
    </div>
  );
}
