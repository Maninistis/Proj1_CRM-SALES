import { getAllRoles } from "@/features/role/repositories/role.repository";
import { UserForm } from "@/components/users/user-form";
import { PageHeader } from "@/components/page-header";

export default async function NewUserPage() {
  const roles = await getAllRoles();

  return (
    <div className="space-y-6">
      <PageHeader title="New User" description="Create a new system user" />
      <UserForm roles={roles} />
    </div>
  );
}
