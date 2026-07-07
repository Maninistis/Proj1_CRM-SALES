import Link from "next/link";
import { userQuerySchema } from "@/features/user/schemas/user-query";
import { list as listUsers } from "@/features/user/services/user.service";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { UserTable } from "@/components/users/user-table";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = userQuerySchema.parse({
    page: params.page || 1,
    pageSize: params.pageSize || 20,
    search: params.search,
    status: params.status,
  });

  const { data, total } = await listUsers({
    page: query.page,
    pageSize: query.pageSize,
    search: query.search,
    status: query.status,
  });

  const totalPages = Math.ceil(total / query.pageSize);

  const serializableData = data.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    status: u.status,
    role: { name: u.role.name },
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage system users and their roles">
        <Link href="/users/new" className={buttonVariants()}>New User</Link>
      </PageHeader>
      <UserTable
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
