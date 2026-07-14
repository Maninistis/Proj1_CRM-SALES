import { getById as getUser } from "@/features/user/services/user.service";
import { getAllRoles } from "@/features/role/repositories/role.repository";
import { UserEditForm } from "@/components/users/user-edit-form";
import { PageHeader } from "@/components/page-header";
import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { notFound } from "next/navigation";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const isAdmin = hasPermission(session!.user.permissions, "*");

  const user = await getUser(id);
  const roles = await getAllRoles();

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit User" description={user.email} />
      <UserEditForm
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          roleRoleId: user.roleRoleId,
          status: user.status,
          role: { name: user.role.name },
        }}
        roles={roles}
        canEditRole={isAdmin}
      />
    </div>
  );
}
