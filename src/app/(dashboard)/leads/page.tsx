import Link from "next/link";
import { leadQuerySchema } from "@/features/lead/schemas/lead-query";
import { list as listLeads } from "@/features/lead/services/lead.service";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { LeadTable } from "@/components/leads/lead-table";
import { LEAD_STATUS_OPTIONS } from "@/features/lead/constants";
import { cn } from "@/lib/utils";

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

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const url = new URLSearchParams();
    url.set("page", "1");
    const merged = {
      search: query.search,
      status: query.status,
      source: query.source,
      deleted: query.deleted,
      ...overrides,
    };
    for (const [k, v] of Object.entries(merged)) {
      if (v) url.set(k, v);
    }
    return `?${url.toString()}`;
  };

  const chipClass = (isActive: boolean) =>
    cn(
      "rounded-md border px-3 py-1 text-sm transition-colors",
      isActive
        ? "border-[#103447] bg-[#103447] text-[#F1EBE3]"
        : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  return (
    <div className="mx-auto max-w-[1440px] space-y-4">
      <PageHeader
        title={isDeletedView ? "Deleted Leads" : "Leads"}
        description={isDeletedView ? "Restore or review deleted leads" : "Manage your sales leads"}
      >
        <div className="flex items-center gap-2">
          {!isDeletedView && (
            <Link href="/leads/new" className={buttonVariants()}>New Lead</Link>
          )}
          <Link
            href={isDeletedView ? "/leads" : "/leads?deleted=true"}
            className={buttonVariants({ variant: "outline" })}
          >
            {isDeletedView ? "Back" : "View Deleted"}
          </Link>
        </div>
      </PageHeader>

      {!isDeletedView && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</p>
          <div className="flex flex-wrap gap-2">
            <Link href={buildUrl({ status: undefined })} className={chipClass(!query.status)}>All</Link>
            {LEAD_STATUS_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={buildUrl({ status: query.status === opt.value ? undefined : opt.value })}
                className={chipClass(query.status === opt.value)}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      )}

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
