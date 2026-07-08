import { list as listAuditLogs } from "@/features/audit-log/services/audit-log.service";
import { PageHeader } from "@/components/page-header";
import { AuditLogTable } from "@/components/audit-log/audit-log-table";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 20;
  const entityType = params.entityType as string | undefined;

  const { data, total } = await listAuditLogs({ page, pageSize, entityType });
  const totalPages = Math.ceil(total / pageSize);

  const serializableData = data.map((log) => ({
    id: log.id,
    entityType: log.entityType,
    entityId: log.entityId,
    action: log.action,
    userName: log.userName,
    createdAt: log.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" description="System change history" />
      <AuditLogTable
        data={serializableData}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
      />
    </div>
  );
}
