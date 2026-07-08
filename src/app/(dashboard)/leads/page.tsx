import Link from "next/link";
import { leadQuerySchema } from "@/features/lead/schemas/lead-query";
import { list as listLeads } from "@/features/lead/services/lead.service";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { LeadTable } from "@/components/leads/lead-table";
import { LEAD_STATUS_OPTIONS } from "@/features/lead/constants";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = leadQuerySchema.parse({
    page: params.page || 1,
    pageSize: params.pageSize || 20,
    search: params.search,
    status: params.status,
    source: params.source,
    deleted: params.deleted || "false",
  });

  const { data, total } = await listLeads({
    page: query.page,
    pageSize: query.pageSize,
    search: query.search,
    status: query.status,
    source: query.source,
    deleted: query.deleted === "true",
  });

  const totalPages = Math.ceil(total / query.pageSize);

  const serializableData = data.map((l) => ({
    id: l.id,
    documentNo: l.documentNo,
    firstName: l.firstName,
    lastName: l.lastName,
    email: l.email,
    company: l.company,
    source: l.source,
    status: l.status,
    assignedTo: l.assignedTo ? { name: l.assignedTo.name } : null,
    createdAt: l.createdAt.toISOString(),
  }));

  const isDeletedView = query.deleted === "true";

  return (
    <div className="space-y-6">
      <PageHeader
        title={isDeletedView ? "Deleted Leads" : "Leads"}
        description={isDeletedView ? "Restore or review deleted leads" : "Manage your sales leads"}
      >
        {!isDeletedView && (
          <Link href="/leads/new" className={buttonVariants()}>New Lead</Link>
        )}
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        {!isDeletedView && (
          <>
            {LEAD_STATUS_OPTIONS.map((opt) => {
              const isActive = query.status === opt.value;
              const url = new URLSearchParams();
              url.set("page", "1");
              if (opt.value !== "NEW" || isActive) url.set("status", opt.value);
              if (query.search) url.set("search", query.search);
              if (query.deleted) url.set("deleted", query.deleted);
              const href = `?${url.toString()}`;
              const finalHref = isActive ? `?page=1${query.search ? `&search=${query.search}` : ""}${query.deleted ? `&deleted=${query.deleted}` : ""}` : href;
              return (
                <Link
                  key={opt.value}
                  href={finalHref}
                  className={`rounded-md border px-3 py-1 text-sm ${isActive ? "bg-[#103447] text-[#F1EBE3] border-[#103447]" : "border-border hover:bg-muted"}`}
                >
                  {opt.label}
                </Link>
              );
            })}
          </>
        )}
        <Link
          href={isDeletedView ? "/leads" : "/leads?deleted=true"}
          className="ml-auto rounded-md border border-border px-3 py-1 text-sm hover:bg-muted"
        >
          {isDeletedView ? "← Back to Leads" : "View Deleted"}
        </Link>
      </div>

      <LeadTable
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
