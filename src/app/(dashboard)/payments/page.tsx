import Link from "next/link";
import { paymentQuerySchema } from "@/features/payment/schemas/payment-query";
import { list as listPayments } from "@/features/payment/services/payment.service";
import { PageHeader } from "@/components/page-header";
import { PaymentTable } from "@/components/payments/payment-table";
import { STATUS_OPTIONS, METHOD_OPTIONS } from "@/features/payment/constants";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = paymentQuerySchema.parse({
    page: params.page || 1,
    pageSize: params.pageSize || 20,
    search: params.search,
    status: params.status,
    method: params.method,
    deleted: params.deleted || "false",
  });

  const { data, total } = await listPayments({
    page: query.page, pageSize: query.pageSize,
    search: query.search, status: query.status,
    method: query.method,
    deleted: query.deleted === "true",
  });

  const totalPages = Math.ceil(total / query.pageSize);
  const isDeletedView = query.deleted === "true";

  const serializableData = data.map((p) => ({
    id: p.id, documentNo: p.documentNo, customerName: p.customerName,
    amount: p.amount.toString(), paymentMethod: p.paymentMethod,
    status: p.status, paymentDate: p.paymentDate.toISOString(),
    salesInvoice: p.salesInvoice ? { documentNo: p.salesInvoice.documentNo } : null,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title={isDeletedView ? "Deleted Payments" : "Payments"} description={isDeletedView ? "Restore deleted payments" : "Record and track customer payments"} />

      <div className="flex flex-wrap items-center gap-2">
        {!isDeletedView && (
          <>
            {STATUS_OPTIONS.map((opt) => {
              const isActive = query.status === opt.value;
              const url = new URLSearchParams();
              url.set("page", "1");
              if (!isActive) url.set("status", opt.value);
              if (query.search) url.set("search", query.search);
              if (query.method) url.set("method", query.method);
              return <Link key={opt.value} href={`?${url.toString()}`} className={`rounded-md border px-3 py-1 text-sm ${isActive ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>{opt.label}</Link>;
            })}
            <span className="mx-2 text-muted-foreground">|</span>
            {METHOD_OPTIONS.map((opt) => {
              const isActive = query.method === opt.value;
              const url = new URLSearchParams();
              url.set("page", "1");
              if (!isActive) url.set("method", opt.value);
              if (query.search) url.set("search", query.search);
              if (query.status) url.set("status", query.status);
              return <Link key={opt.value} href={`?${url.toString()}`} className={`rounded-md border px-3 py-1 text-sm ${isActive ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>{opt.label}</Link>;
            })}
          </>
        )}
        <Link href={isDeletedView ? "/payments" : "/payments?deleted=true"} className="ml-auto rounded-md border border-border px-3 py-1 text-sm hover:bg-muted">
          {isDeletedView ? "← Back" : "View Deleted"}
        </Link>
      </div>

      <PaymentTable data={serializableData} page={query.page} pageSize={query.pageSize} total={total} totalPages={totalPages} search={query.search} />
    </div>
  );
}
