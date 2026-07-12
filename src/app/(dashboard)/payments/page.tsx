import Link from "next/link";
import { paymentQuerySchema } from "@/features/payment/schemas/payment-query";
import { list as listPayments } from "@/features/payment/services/payment.service";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { PaymentTable } from "@/components/payments/payment-table";
import { STATUS_OPTIONS, METHOD_OPTIONS } from "@/features/payment/constants";
import { cn } from "@/lib/utils";

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
    method: query.method, deleted: query.deleted === "true",
  });

  const totalPages = Math.ceil(total / query.pageSize);
  const isDeletedView = query.deleted === "true";

  const serializableData = data.map((p) => ({
    id: p.id, documentNo: p.documentNo, customerName: p.customerName,
    amount: p.amount.toString(), paymentMethod: p.paymentMethod,
    status: p.status, paymentDate: p.paymentDate.toISOString(),
    referenceNumber: p.referenceNumber,
    salesInvoice: p.salesInvoice ? { documentNo: p.salesInvoice.documentNo } : null,
  }));

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const url = new URLSearchParams();
    url.set("page", "1");
    const merged = {
      search: query.search, status: query.status, method: query.method,
      deleted: query.deleted, ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) if (v) url.set(k, v);
    return `?${url.toString()}`;
  };

  const chipClass = (isActive: boolean) =>
    cn("rounded-md border px-3 py-1 text-sm transition-colors",
      isActive ? "border-[#103447] bg-[#103447] text-[#F1EBE3]" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title={isDeletedView ? "Deleted Payments" : "Payments"}
        description={isDeletedView ? "Restore deleted payments" : "Record and track customer payments"}
      >
        <div className="flex items-center gap-2">
          <Link
            href={isDeletedView ? "/payments" : "/payments?deleted=true"}
            className={buttonVariants({ variant: "outline" })}
          >
            {isDeletedView ? "Back" : "View Deleted"}
          </Link>
        </div>
      </PageHeader>

      {!isDeletedView && (
        <div className="space-y-4">
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

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Payment Method</p>
            <div className="flex flex-wrap gap-2">
              <Link href={buildUrl({ method: undefined })} className={chipClass(!query.method)}>All</Link>
              {METHOD_OPTIONS.map((opt) => (
                <Link key={opt.value} href={buildUrl({ method: query.method === opt.value ? undefined : opt.value })} className={chipClass(query.method === opt.value)}>
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <PaymentTable data={serializableData} page={query.page} pageSize={query.pageSize} total={total} totalPages={totalPages} search={query.search} />
    </div>
  );
}
