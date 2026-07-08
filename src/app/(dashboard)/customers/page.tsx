import Link from "next/link";
import { customerQuerySchema } from "@/features/customer/schemas/customer-query";
import { list as listCustomers } from "@/features/customer/services/customer.service";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { CustomerTable } from "@/components/customers/customer-table";
import { STATUS_OPTIONS } from "@/features/customer/constants";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = customerQuerySchema.parse({
    page: params.page || 1,
    pageSize: params.pageSize || 20,
    search: params.search,
    status: params.status,
    deleted: params.deleted || "false",
  });

  const { data, total } = await listCustomers({
    page: query.page,
    pageSize: query.pageSize,
    search: query.search,
    status: query.status,
    deleted: query.deleted === "true",
  });

  const totalPages = Math.ceil(total / query.pageSize);

  const serializableData = data.map((c) => ({
    id: c.id,
    documentNo: c.documentNo,
    name: c.name,
    email: c.email,
    phone: c.phone,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
  }));

  const isDeletedView = query.deleted === "true";

  return (
    <div className="space-y-6">
      <PageHeader
        title={isDeletedView ? "Deleted Customers" : "Customers"}
        description={isDeletedView ? "Restore deleted customers" : "Manage your customer database"}
      >
        {!isDeletedView && (
          <Link href="/customers/new" className={buttonVariants()}>New Customer</Link>
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
          href={isDeletedView ? "/customers" : "/customers?deleted=true"}
          className="ml-auto rounded-md border border-border px-3 py-1 text-sm hover:bg-muted"
        >
          {isDeletedView ? "← Back" : "View Deleted"}
        </Link>
      </div>

      <CustomerTable
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
