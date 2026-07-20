import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MessagingCenter } from "@/features/messaging/components/messaging-center";
import { BusinessAutoSelect } from "@/components/layout/business-auto-select";
import { getBusinessesForUser } from "@/lib/auth/business";
import { hasPermission } from "@/lib/auth/permissions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const businesses = await getBusinessesForUser(session.user.userId);

  if (businesses.length === 0) {
    redirect("/onboarding");
  }

  const isAdmin = hasPermission(session.user.permissions, "*");
  let businessId = session.user.businessId;
  let needsAutoSelect = false;

  const validBizIds = new Set(businesses.map((b) => b.id));
  if (businessId === "all") {
    if (!isAdmin) {
      businessId = businesses[0].id;
      needsAutoSelect = true;
    }
  } else if (!businessId || !validBizIds.has(businessId)) {
    businessId = businesses[0].id;
    needsAutoSelect = true;
  }

  const isGlobalView = businessId === "all";

  if (!isGlobalView) {
    const onboardingSetting = await prisma.setting.findUnique({
      where: {
        key_businessId: {
          key: "onboarding_complete",
          businessId: businessId!,
        },
      },
    });

    if (onboardingSetting?.value !== "true") {
      redirect("/onboarding?step=team");
    }
  }

  const role = await prisma.role.findUnique({
    where: { id: session.user.roleId },
    select: { name: true },
  });

  const currentBiz = !isGlobalView
    ? businesses.find((b) => b.id === businessId)
    : null;
  const currentBusinessName = isGlobalView
    ? "All Businesses"
    : currentBiz?.name ?? "Select Business";

  return (
    <>
      {needsAutoSelect && businessId && (
        <BusinessAutoSelect businessId={businessId} />
      )}
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          user={session.user}
          profile={{
            name: session.user.name ?? null,
            email: session.user.email ?? null,
            roleName: role?.name ?? "User",
          }}
          businesses={businesses}
          currentBusinessId={businessId}
          currentBusinessName={currentBusinessName}
          canManageBusinesses={isAdmin}
          isGlobalView={isGlobalView}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar permissions={session.user.permissions} isGlobalView={isGlobalView} />
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
            {children}
          </main>
        </div>
        <MessagingCenter />
      </div>
    </>
  );
}
