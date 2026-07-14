import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { getById as getRoleById } from "@/features/role/services/role.service";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MessagingCenter } from "@/features/messaging/components/messaging-center";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = await getRoleById(session.user.roleId);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        user={session.user}
        profile={{
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          roleName: role?.name ?? "User",
        }}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar permissions={session.user.permissions} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
      <MessagingCenter />
    </div>
  );
}
