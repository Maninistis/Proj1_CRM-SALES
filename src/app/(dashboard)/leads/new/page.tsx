import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/auth";
import { isPrivilegedUser } from "@/lib/auth/data-scope";
import { LeadForm } from "@/components/leads/lead-form";
import { PageHeader } from "@/components/page-header";

export default async function NewLeadPage() {
  const session = await auth();
  const canAssign = isPrivilegedUser(session?.user?.permissions ?? []);

  const users = canAssign
    ? await prisma.user.findMany({
        where: { status: "ACTIVE" },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader title="New Lead" description="Create a new sales lead" />
      <LeadForm users={users} currentUserId={session!.user.userId} canAssign={canAssign} />
    </div>
  );
}
