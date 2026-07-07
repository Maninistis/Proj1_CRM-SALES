import { getById as getRole } from "@/features/role/services/role.service";
import { getAllPermissions } from "@/features/role/services/role.service";
import { RoleEditForm } from "@/components/roles/role-edit-form";
import { PageHeader } from "@/components/page-header";
import { notFound } from "next/navigation";

export default async function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getRole(id);
  const permissions = await getAllPermissions();

  if (!role) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Role" description={role.name} />
      <RoleEditForm
        role={{
          id: role.id,
          name: role.name,
          description: role.description ?? "",
          permissionIds: role.rolePermissions.map((rp) => rp.permissionId),
        }}
        permissions={permissions}
      />
    </div>
  );
}
