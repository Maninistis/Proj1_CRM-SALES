import Link from "next/link";
import { getById as getUser } from "@/features/user/services/user.service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.name}
        description={user.email}
      >
        <Link href={`/users/${id}/edit`} className={buttonVariants({ variant: "outline" })}>Edit</Link>
      </PageHeader>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <span>{user.role.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>
              {user.status}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Login</span>
            <span>
              {user.lastLoginAt
                ? new Date(user.lastLoginAt).toLocaleString()
                : "Never"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{new Date(user.createdAt).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
