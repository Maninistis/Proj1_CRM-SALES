import { getAllRoles } from "@/features/role/repositories/role.repository";
import { UserForm } from "@/components/users/user-form";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";

export default async function NewUserPage() {
  const session = await auth();
  const isAdmin = hasPermission(session!.user.permissions, "*");

  const [allRoles, managers, repRole] = await Promise.all([
    getAllRoles(),
    prisma.user.findMany({
      where: { status: "ACTIVE", role: { name: "Sales Manager" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.role.findUnique({ where: { name: "Sales Rep" } }),
  ]);

  const roles = isAdmin
    ? allRoles.filter((r) => r.name === "Sales Manager" || r.name === "Sales Rep")
    : allRoles.filter((r) => r.name === "Sales Rep");

  return (
    <div className="space-y-6">
      <PageHeader title="New User" description="Create an employee profile" />
      <UserForm
        roles={roles}
        managers={managers}
        lockRoleToRep={!isAdmin}
        repRoleId={repRole?.id}
      />
    </div>
  );
}
