import Link from "next/link";
import { list as listRoles } from "@/features/role/services/role.service";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { RoleTable } from "@/components/roles/role-table";

export default async function RolesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 20;
  const search = params.search as string | undefined;

  const { data, total } = await listRoles({ page, pageSize, search });
  const totalPages = Math.ceil(total / pageSize);

  const serializableData = data.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    permissionCount: r.rolePermissions.length,
    userCount: r._count.users,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Roles" description="Manage roles and permissions">
        <Link href="/roles/new" className={buttonVariants()}>New Role</Link>
      </PageHeader>
      <RoleTable
        data={serializableData}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        search={search}
      />
    </div>
  );
}
