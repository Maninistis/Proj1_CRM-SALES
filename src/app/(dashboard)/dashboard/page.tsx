import type { ReactNode } from "react";
import { Suspense } from "react";
import { UserPlus, TrendingUp, ShoppingCart, Receipt, Truck, Clock } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { isPrivilegedUser } from "@/lib/auth/data-scope";
import { hasPermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

import { getDashboardData } from "@/features/dashboard/services/dashboard.service";
import { getManagerOnboardingStatus } from "@/features/dashboard/services/manager-onboarding.service";
import { getEmployeeDashboardData } from "@/features/dashboard/services/employee-dashboard.service";
import { getEmployeeOnboardingStatus } from "@/features/dashboard/services/employee-onboarding.service";
import { getTeamActivity, getTeamWorkQueue } from "@/features/dashboard/services/team.service";
import { getNeedsAttention } from "@/features/dashboard/services/needs-attention.service";
import {
  getAdminBusinessDashboardData,
  getExecutiveDashboardData,
} from "@/features/dashboard/services/admin-dashboard.service";
import { getDashboardPrefs } from "@/features/dashboard/services/dashboard-prefs.service";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { PipelineView } from "@/components/dashboard/pipeline-view";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopCustomers } from "@/components/dashboard/top-customers";
import { DateFilter } from "@/components/dashboard/date-filter";
import { DashboardWidgetGrid } from "@/components/dashboard/dashboard-widget-grid";
import { CustomizeDashboardLink } from "@/components/dashboard/customize-dashboard-link";
import { ManagerGettingStarted } from "@/components/dashboard/manager/manager-getting-started";
import { ManagerQuickActions } from "@/components/dashboard/manager/manager-quick-actions";
import { ManagerRecentCustomers } from "@/components/dashboard/manager/manager-recent-customers";
import { NeedsAttention } from "@/components/dashboard/manager/needs-attention";
import { TeamActivity } from "@/components/dashboard/manager/team-activity";
import { CurrentWorkQueue } from "@/components/dashboard/manager/current-work-queue";

import { BusinessDashboard } from "@/components/dashboard/admin/business-dashboard";
import { ExecutiveDashboard } from "@/components/dashboard/admin/executive-dashboard";

import { AssignedLeadsCard } from "@/components/dashboard/employee/assigned-leads-card";
import { MonthlyPerformanceCard } from "@/components/dashboard/employee/monthly-performance-card";
import { ImmediateAttentionCard } from "@/components/dashboard/employee/immediate-attention-card";
import { EmployeePipelineView } from "@/components/dashboard/employee/employee-pipeline-view";
import { EmployeeQuickActions } from "@/components/dashboard/employee/employee-quick-actions";
import { EmployeeGettingStarted } from "@/components/dashboard/employee/employee-getting-started";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const range = (params.range as string) || "all";
  const session = await auth();
  const isGlobalView = session?.user?.businessId === "all";
  const perms = session?.user?.permissions ?? [];
  const isAdmin = hasPermission(perms, "*");
  const isRep = !isPrivilegedUser(perms);

  if (isRep) {
    return <EmployeeDashboard />;
  }

  if (isAdmin) {
    return isGlobalView
      ? <ExecutiveDashboardAsync range={range} />
      : <BusinessDashboardAsync range={range} session={session} />;
  }

  return <ManagerDashboard range={range} session={session} />;
}

// ---------------------------------------------------------------------------
// Admin — Single Business
// ---------------------------------------------------------------------------

async function BusinessDashboardAsync({
  range,
  session,
}: {
  range: string;
  session: Awaited<ReturnType<typeof auth>>;
}) {
  const businessId = session?.user?.businessId;
  if (!businessId || businessId === "all") return null;

  const [data, onboarding, teamActivity, adminData, prefs] = await Promise.all([
    getDashboardData(range as never),
    getManagerOnboardingStatus(),
    getTeamActivity(12),
    getAdminBusinessDashboardData(businessId),
    getDashboardPrefs("admin-business"),
  ]);

  if (!data || !adminData) {
    return <div className="p-6"><p className="text-sm text-[#787F87]">Loading...</p></div>;
  }

  const activityUserIds = (teamActivity ?? []).map((a) => a.userId).filter(Boolean);
  const activityUsers = activityUserIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: activityUserIds } }, select: { id: true, name: true } })
    : [];
  const activityUserNames: Record<string, string> = {};
  for (const u of activityUsers) activityUserNames[u.id] = u.name;

  const recentCustomers = await prisma.customer.findMany({
    where: { businessId, deletedAt: null },
    select: { id: true, name: true },
    orderBy: { updatedAt: "desc" },
    take: 3,
  });

  return (
    <BusinessDashboard
      businessName={adminData.businessOverview.businessName}
      range={range}
      dashboardData={data}
      onboarding={onboarding}
      teamActivity={teamActivity}
      activityUserNames={activityUserNames}
      recentCustomers={recentCustomers}
      adminData={adminData}
      prefs={prefs}
    />
  );
}

// ---------------------------------------------------------------------------
// Admin — All Businesses (Executive)
// ---------------------------------------------------------------------------

async function ExecutiveDashboardAsync({ range }: { range: string }) {
  const session = await auth();
  const [data, executiveData, prefs] = await Promise.all([
    getDashboardData(range as never),
    getExecutiveDashboardData(range as never),
    getDashboardPrefs("admin-executive"),
  ]);

  if (!data || !executiveData) {
    return <div className="p-6"><p className="text-sm text-[#787F87]">Loading...</p></div>;
  }

  return (
    <ExecutiveDashboard
      currentBusinessId={session?.user?.businessId ?? null}
      dashboardData={data}
      executiveData={executiveData}
      prefs={prefs}
    />
  );
}

// ---------------------------------------------------------------------------
// Manager
// ---------------------------------------------------------------------------

async function ManagerDashboard({
  range,
  session,
}: {
  range: string;
  session: Awaited<ReturnType<typeof auth>>;
}) {
  const [data, onboarding, teamActivity, needsAttention, workQueue, prefs] = await Promise.all([
    getDashboardData(range as never),
    getManagerOnboardingStatus(),
    getTeamActivity(12),
    getNeedsAttention(),
    getTeamWorkQueue(),
    getDashboardPrefs("manager"),
  ]);

  if (!data) return <div className="p-6"><p className="text-sm text-[#787F87]">Loading...</p></div>;

  const { kpis, pipeline, revenueTrend, topCustomers } = data;

  const activityUserIds = (teamActivity ?? []).map((a) => a.userId).filter(Boolean);
  const activityUsers = activityUserIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: activityUserIds } }, select: { id: true, name: true } })
    : [];
  const activityUserNames: Record<string, string> = {};
  for (const u of activityUsers) activityUserNames[u.id] = u.name;

  const businessId = session?.user?.businessId;
  const recentCustomers = businessId && businessId !== "all"
    ? await prisma.customer.findMany({
        where: { businessId, deletedAt: null },
        select: { id: true, name: true },
        orderBy: { updatedAt: "desc" },
        take: 3,
      })
    : [];

  const widgets: Record<string, ReactNode> = {
    "kpi-row": (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.uncontactedLeads !== null && (
          <KpiCard title="Uncontacted Leads" value={kpis.uncontactedLeads} description="awaiting first contact" icon={UserPlus} href="/leads" accent="#1A5366" />
        )}
        {kpis.activeOpportunities !== null && (
          <KpiCard title="Active Opps" value={kpis.activeOpportunities} description={`₱${kpis.oppsValue.toLocaleString()} value`} icon={TrendingUp} href="/opportunities" accent="#2F6D7A" />
        )}
        {kpis.awaitingPayment !== null && (
          <KpiCard title="Awaiting Payment" value={kpis.awaitingPayment} description="SOs unpaid" icon={Clock} href="/sales-orders" accent="#8A6446" />
        )}
        {kpis.pendingInvoices !== null && (
          <KpiCard title="Open Invoices" value={kpis.pendingInvoices} description="awaiting payment" icon={Receipt} href="/sales-invoices" accent="#E3B04B" />
        )}
        {kpis.readyForDelivery !== null && (
          <KpiCard title="Ready for Delivery" value={kpis.readyForDelivery} description="paid · unfulfilled" icon={Truck} href="/delivery-notes" accent="#4A5560" />
        )}
        {kpis.totalRevenue !== null && (
          <KpiCard title="Revenue" value={`₱${kpis.totalRevenue.toLocaleString()}`} description="collected" icon={Truck} href="/payments" accent="#2E8B57" />
        )}
      </div>
    ),
    "getting-started": onboarding && !onboarding.dismissed && (
      <ManagerGettingStarted status={onboarding} />
    ),
    "pipeline": <PipelineView data={pipeline} />,
    "revenue-chart": <RevenueChart data={revenueTrend} />,
    "quick-actions": <ManagerQuickActions />,
    "recent-customers": <ManagerRecentCustomers customers={recentCustomers} />,
    "needs-attention": <NeedsAttention items={needsAttention} />,
    "team-activity": <TeamActivity activities={teamActivity} userNames={activityUserNames} />,
    "top-customers": <TopCustomers customers={topCustomers ?? null} />,
    "current-work-queue": <CurrentWorkQueue queue={workQueue} />,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-y-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-[#103447]">
            {`Welcome back, ${session?.user?.name?.split(" ")[0] ?? "User"}`}
          </h1>
          <p className="text-sm text-[#787F87]">
            Here&apos;s what&apos;s happening with your business
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Suspense fallback={null}>
            <DateFilter />
          </Suspense>
          <CustomizeDashboardLink />
        </div>
      </div>

      <DashboardWidgetGrid context="manager" prefs={prefs} widgets={widgets} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Employee (Sales Rep)
// ---------------------------------------------------------------------------

async function EmployeeDashboard() {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const [data, onboarding, prefs] = await Promise.all([
    getEmployeeDashboardData(),
    getEmployeeOnboardingStatus(),
    getDashboardPrefs("employee"),
  ]);

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-sm text-[#787F87]">Loading...</p>
      </div>
    );
  }

  const widgets: Record<string, ReactNode> = {
    "kpi-row": (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <AssignedLeadsCard data={data.assignedLeads} />
        {data.permissions.opportunities && (
          <KpiCard title="Active Opps" value={data.kpiStats.activeOpportunities} description="open deals" icon={TrendingUp} href="/opportunities" accent="#2F6D7A" />
        )}
        {data.permissions.salesOrders && (
          <KpiCard title="Awaiting Payment" value={data.kpiStats.assignedSalesOrders} description="SOs in progress" icon={Clock} href="/sales-orders" accent="#8A6446" />
        )}
        {data.permissions.invoices && (
          <KpiCard title="Open Invoices" value={data.kpiStats.pendingInvoices} description="awaiting payment" icon={Receipt} href="/sales-invoices" accent="#E3B04B" />
        )}
        {data.permissions.salesOrders && data.permissions.invoices && data.permissions.deliveryNotes && (
          <KpiCard title="Ready for Delivery" value={data.kpiStats.readyForDelivery} description={data.kpiStats.readyForDeliveryPriorDeleted > 0 ? `paid & unfulfilled · ${data.kpiStats.readyForDeliveryPriorDeleted} prior deletion${data.kpiStats.readyForDeliveryPriorDeleted === 1 ? "" : "s"}` : "paid & unfulfilled"} icon={Truck} href="/delivery-notes" accent="#4A5560" />
        )}
        {data.permissions.payments && (
          <KpiCard title="Revenue" value={`₱${(data.monthlyPerformance?.revenueClosed ?? 0).toLocaleString()}`} description="this month" icon={ShoppingCart} href="/payments" accent="#2E8B57" />
        )}
      </div>
    ),
    "monthly-performance": <MonthlyPerformanceCard data={data.monthlyPerformance} />,
    "immediate-attention": <ImmediateAttentionCard items={data.immediateAttention} />,
    "getting-started": onboarding && !onboarding.dismissed && (
      <EmployeeGettingStarted status={onboarding} />
    ),
    "pipeline": <EmployeePipelineView data={data.pipeline} />,
    "quick-actions": <EmployeeQuickActions data={data} />,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-y-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-[#103447]">
            Hi, {firstName}
          </h1>
          <p className="text-sm text-[#787F87]">Here&apos;s what to work on today.</p>
        </div>
        <CustomizeDashboardLink />
      </div>

      <DashboardWidgetGrid context="employee" prefs={prefs} widgets={widgets} />
    </div>
  );
}
