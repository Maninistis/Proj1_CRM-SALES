import Link from "next/link";
import { opportunityQuerySchema } from "@/features/opportunity/schemas/opportunity-query";
import { list as listOpportunities } from "@/features/opportunity/services/opportunity.service";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { OpportunityTable } from "@/components/opportunities/opportunity-table";
import { STAGE_OPTIONS, STATUS_OPTIONS } from "@/features/opportunity/constants";

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

  return (
    <div className="space-y-6">
      <PageHeader
        title={isDeletedView ? "Deleted Opportunities" : "Opportunities"}
        description={isDeletedView ? "Restore deleted opportunities" : "Manage your sales opportunities"}
      >
        {!isDeletedView && (
          <Link href="/opportunities/new" className={buttonVariants()}>New Opportunity</Link>
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
              if (query.stage) url.set("stage", query.stage);
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
            <span className="mx-2 text-muted-foreground">|</span>
            {STAGE_OPTIONS.map((opt) => {
              const isActive = query.stage === opt.value;
              const url = new URLSearchParams();
              url.set("page", "1");
              if (!isActive) url.set("stage", opt.value);
              if (query.search) url.set("search", query.search);
              if (query.status) url.set("status", query.status);
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
          href={isDeletedView ? "/opportunities" : "/opportunities?deleted=true"}
          className="ml-auto rounded-md border border-border px-3 py-1 text-sm hover:bg-muted"
        >
          {isDeletedView ? "← Back" : "View Deleted"}
        </Link>
      </div>

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
