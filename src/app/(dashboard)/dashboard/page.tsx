import { getDashboardData } from "@/features/dashboard/services/dashboard.service";
import { getOnboardingStatus } from "@/features/dashboard/services/onboarding.service";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PipelineView } from "@/components/dashboard/pipeline-view";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { PendingInvoices } from "@/components/dashboard/pending-invoices";
import { TopCustomers } from "@/components/dashboard/top-customers";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Notifications } from "@/components/dashboard/notifications";
import { DateFilter } from "@/components/dashboard/date-filter";
import { UserPlus, TrendingUp, Building2, ShoppingCart, Receipt, Wallet } from "lucide-react";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const range = (params.range as string) || "all";
  const [data, onboarding] = await Promise.all([
    getDashboardData(range as any),
    getOnboardingStatus(),
  ]);
  const session = await auth();
  const isGlobalView = session?.user?.businessId === "all";

  if (!data) return <div className="p-6"><p className="text-sm text-[#787F87]">Loading...</p></div>;

  const { kpis, pipeline, revenueTrend, recentActivities, pendingInvoices, topCustomers, notifications, permissions } = data;

  const userIds = recentActivities?.map((a) => a.userId).filter(Boolean) ?? [];
  const users = userIds.length > 0
    ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })
    : [];
  const userNames: Record<string, string> = {};
  for (const u of users) userNames[u.id] = u.name;

  return (
    <div className="space-y-5">
      {/* Compact header with date filter */}
      <div className="flex flex-wrap items-center justify-between gap-y-3">
        <div>
          <h1 className="font-heading text-xl font-bold text-[#103447]">
            {isGlobalView
              ? "All Businesses Overview"
              : `Welcome back, ${session?.user?.name?.split(" ")[0] ?? "User"}`}
          </h1>
          <p className="text-sm text-[#787F87]">
            {isGlobalView
              ? "Aggregated analytics across every business you manage"
              : "Here's what's happening with your business"}
          </p>
        </div>
        <Suspense fallback={null}>
          <DateFilter />
        </Suspense>
      </div>

      {/* Alert banner */}
      {notifications && notifications.length > 0 && (
        <Notifications notifications={notifications} />
      )}

      {/* KPI Cards — 6 columns on desktop */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.leads !== null && (
          <KpiCard title="Total Leads" value={kpis.leads} description="all leads" icon={UserPlus} trend={kpis.leadsTrend} href="/leads" accent="#1A5366" />
        )}
        {kpis.activeOpportunities !== null && (
          <KpiCard title="Active Opps" value={kpis.activeOpportunities} description={`₱${kpis.oppsValue.toLocaleString()} value`} icon={TrendingUp} href="/opportunities" accent="#2F6D7A" />
        )}
        {kpis.customers !== null && (
          <KpiCard title="Customers" value={kpis.customers} description="active accounts" icon={Building2} trend={kpis.customersTrend} href="/customers" accent="#6B8A7A" />
        )}
        {kpis.salesOrders !== null && (
          <KpiCard title="Sales Orders" value={kpis.salesOrders} description="in progress" icon={ShoppingCart} href="/sales-orders" accent="#8A6446" />
        )}
        {kpis.pendingInvoices !== null && (
          <KpiCard title="Pending Inv." value={kpis.pendingInvoices} description="awaiting payment" icon={Receipt} href="/sales-invoices" accent="#E3B04B" />
        )}
        {kpis.totalRevenue !== null && (
          <KpiCard title="Revenue" value={`₱${kpis.totalRevenue.toLocaleString()}`} description="collected" icon={Wallet} trend={kpis.revenueTrend} href="/payments" accent="#2E8B57" />
        )}
      </div>

      {/* Pipeline + Revenue side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PipelineView data={pipeline} />
        <RevenueChart data={revenueTrend} />
      </div>

      {/* Pending Invoices + Recent Activities */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PendingInvoices invoices={pendingInvoices ?? null} />
        <RecentActivities activities={recentActivities ?? null} userNames={userNames} />
      </div>

      {/* Top Customers + Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-2">
        <TopCustomers customers={topCustomers ?? null} />
        {!isGlobalView && (
          <QuickActions permissions={permissions} onboarding={onboarding} />
        )}
      </div>
    </div>
  );
}
