import Link from "next/link";
import { opportunityQuerySchema } from "@/features/opportunity/schemas/opportunity-query";
import { list as listOpportunities } from "@/features/opportunity/services/opportunity.service";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { OpportunityTable } from "@/components/opportunities/opportunity-table";
import { STAGE_OPTIONS, STATUS_OPTIONS } from "@/features/opportunity/constants";
import { cn } from "@/lib/utils";

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = opportunityQuerySchema.parse({
    page: params.page || 1,
    pageSize: params.pageSize || 20,
    search: params.search,
    stage: params.stage,
    status: params.status,
    deleted: params.deleted || "false",
  });

  const { data, total } = await listOpportunities({
    page: query.page,
    pageSize: query.pageSize,
    search: query.search,
    stage: query.stage,
    status: query.status,
    deleted: query.deleted === "true",
  });

  const totalPages = Math.ceil(total / query.pageSize);

  const serializableData = data.map((o) => ({
    id: o.id,
    documentNo: o.documentNo,
    title: o.title,
    estimatedValue: o.estimatedValue.toString(),
    stage: o.stage,
    status: o.status,
    lead: o.lead
      ? { firstName: o.lead.firstName, lastName: o.lead.lastName }
      : null,
    assignedTo: o.assignedTo ? { name: o.assignedTo.name } : null,
    expectedCloseDate: o.expectedCloseDate.toISOString(),
    createdAt: o.createdAt.toISOString(),
  }));

  const isDeletedView = query.deleted === "true";

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const url = new URLSearchParams();
    url.set("page", "1");
    const merged = {
      search: query.search,
      status: query.status,
      stage: query.stage,
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
        title={isDeletedView ? "Deleted Opportunities" : "Opportunities"}
        description={
          isDeletedView
            ? "Restore deleted opportunities"
            : "Manage your sales opportunities"
        }
      >
        <div className="flex items-center gap-2">
          {!isDeletedView && (
            <Link
              href="/opportunities/new"
              className={buttonVariants()}
            >
              New Opportunity
            </Link>
          )}
          <Link
            href={
              isDeletedView
                ? "/opportunities"
                : "/opportunities?deleted=true"
            }
            className={buttonVariants({ variant: "outline" })}
          >
            {isDeletedView ? "Back" : "View Deleted"}
          </Link>
        </div>
      </PageHeader>

      {!isDeletedView && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildUrl({ status: undefined })}
                className={chipClass(!query.status)}
              >
                All
              </Link>
              {STATUS_OPTIONS.map((opt) => (
                <Link
                  key={opt.value}
                  href={buildUrl({
                    status: query.status === opt.value ? undefined : opt.value,
                  })}
                  className={chipClass(query.status === opt.value)}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Pipeline Stage
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildUrl({ stage: undefined })}
                className={chipClass(!query.stage)}
              >
                All
              </Link>
              {STAGE_OPTIONS.map((opt) => (
                <Link
                  key={opt.value}
                  href={buildUrl({
                    stage: query.stage === opt.value ? undefined : opt.value,
                  })}
                  className={chipClass(query.stage === opt.value)}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <OpportunityTable
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
