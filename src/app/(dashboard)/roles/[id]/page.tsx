import Link from "next/link";
import { getById as getRole } from "@/features/role/services/role.service";
import { getAllPermissions } from "@/features/role/services/role.service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getRole(id);

  if (!role) notFound();

  const allPermissions = await getAllPermissions();
  const rolePermissionIds = new Set(
    role.rolePermissions.map((rp) => rp.permissionId)
  );

  const grouped = allPermissions.reduce((acc, p) => {
    const resource = p.code.split(":")[0];
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(p);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  return (
    <div className="space-y-6">
      <PageHeader title={role.name} description={role.description || "No description"}>
        <Link href={`/roles/${id}/edit`} className={buttonVariants({ variant: "outline" })}>Edit</Link>
      </PageHeader>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{role.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Users assigned</span>
              <span>{role._count.users}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Permissions</span>
              <Badge variant="secondary">{role.rolePermissions.length}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(grouped).map(([resource, perms]) => (
                <div key={resource}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {resource}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((p) => (
                      <Badge
                        key={p.id}
                        variant={rolePermissionIds.has(p.id) ? "default" : "outline"}
                      >
                        {p.code.split(":")[1]}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
