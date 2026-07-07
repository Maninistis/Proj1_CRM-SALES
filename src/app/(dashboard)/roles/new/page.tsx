import { getAllPermissions } from "@/features/role/services/role.service";
import { RoleForm } from "@/components/roles/role-form";
import { PageHeader } from "@/components/page-header";

export default async function NewRolePage() {
  const permissions = await getAllPermissions();

  return (
    <div className="space-y-6">
      <PageHeader title="New Role" description="Create a role and assign permissions" />
      <RoleForm permissions={permissions} />
    </div>
  );
}
