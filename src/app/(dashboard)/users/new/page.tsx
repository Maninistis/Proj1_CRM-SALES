import { getAllRoles } from "@/features/role/repositories/role.repository";
import { UserForm } from "@/components/users/user-form";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";

export default async function NewUserPage() {
  const [allRoles, managers] = await Promise.all([
    getAllRoles(),
    prisma.user.findMany({
      where: { status: "ACTIVE", role: { name: "Sales Manager" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const roles = allRoles.filter(
    (r) => r.name === "Sales Manager" || r.name === "Sales Rep"
  );

  return (
    <div className="space-y-6">
      <PageHeader title="New User" description="Create an employee profile" />
      <UserForm roles={roles} managers={managers} />
    </div>
  );
}
