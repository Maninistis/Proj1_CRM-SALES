import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/auth/permissions";

type DateRange = "today" | "7d" | "30d" | "month" | "year" | "all";

function getStartDate(range: DateRange): Date {
  const now = new Date();
  switch (range) {
    case "today": { const d = new Date(now); d.setHours(0, 0, 0, 0); return d; }
    case "7d": return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d": return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "month": return new Date(now.getFullYear(), now.getMonth(), 1);
    case "year": return new Date(now.getFullYear(), 0, 1);
    default: return new Date(0);
  }
}

function getPrevStartDate(range: DateRange, startDate: Date): Date {
  const diff = Date.now() - startDate.getTime();
  return new Date(startDate.getTime() - diff);
}

const ACTION_VERBS: Record<string, string> = {
  CREATE: "created",
  UPDATE: "updated",
  DELETE: "deleted",
  TRANSITION: "updated status of",
};

const ENTITY_LABELS: Record<string, string> = {
  Lead: "Lead",
  Opportunity: "Opportunity",
  Quotation: "Quotation",
  Customer: "Customer",
  SalesOrder: "Sales Order",
  DeliveryNote: "Delivery Note",
  SalesInvoice: "Invoice",
  Payment: "Payment",
  User: "User",
  Role: "Role",
  Setting: "Setting",
};

export async function getDashboardData(range: DateRange = "all") {
  const session = await auth();
  if (!session?.user) return null;

  const perms = session.user.permissions ?? [];
  const userId = session.user.userId;
  const isAdmin = perms.includes("*");
  const startDate = getStartDate(range);
  const prevStart = getPrevStartDate(range, startDate);

  const canLeads = hasPermission(perms, "leads:read");
  const canOpps = hasPermission(perms, "opportunities:read");
  const canCust = hasPermission(perms, "customers:read");
  const canSO = hasPermission(perms, "sales-orders:read");
  const canInv = hasPermission(perms, "sales-invoices:read");
  const canPay = hasPermission(perms, "payments:read");
  const canAudit = hasPermission(perms, "audit-logs:read");
  const canQuotes = hasPermission(perms, "quotations:read");

  const [
    leadCount, leadPrev,
    activeOpps, oppsValue,
    customerCount, customerPrev,
    soCount,
    pendingInvCount,
    revenue, revenuePrev,
    pipeline,
    revenueTrend,
    activities,
    pendingList,
    topCust,
    notifs,
  ] = await Promise.all([
    canLeads ? prisma.lead.count({ where: { deletedAt: null, createdAt: { gte: startDate } } }) : null,
    canLeads ? prisma.lead.count({ where: { deletedAt: null, createdAt: { gte: prevStart, lt: startDate } } }) : null,
    canOpps ? prisma.opportunity.count({ where: { deletedAt: null, status: "OPEN" } }) : null,
    canOpps ? prisma.opportunity.aggregate({ _sum: { estimatedValue: true }, where: { deletedAt: null, status: "OPEN" } }) : null,
    canCust ? prisma.customer.count({ where: { deletedAt: null, status: "ACTIVE", createdAt: { gte: startDate } } }) : null,
    canCust ? prisma.customer.count({ where: { deletedAt: null, status: "ACTIVE", createdAt: { gte: prevStart, lt: startDate } } }) : null,
    canSO ? prisma.salesOrder.count({ where: { deletedAt: null, status: { in: ["CONFIRMED", "FULFILLING", "DELIVERED", "INVOICED"] }, createdAt: { gte: startDate } } }) : null,
    canInv ? prisma.salesInvoice.count({ where: { deletedAt: null, status: { in: ["OPEN", "PARTIALLY_PAID", "OVERDUE"] } } }) : null,
    canPay ? prisma.payment.aggregate({ _sum: { amount: true }, where: { deletedAt: null, status: "RECEIVED", paymentDate: { gte: startDate } } }) : null,
    canPay ? prisma.payment.aggregate({ _sum: { amount: true }, where: { deletedAt: null, status: "RECEIVED", paymentDate: { gte: prevStart, lt: startDate } } }) : null,
    getPipeline(perms, startDate, isAdmin, userId),
    getRevenueTrend(perms, range),
    canAudit ? prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
    }) : null,
    canInv ? prisma.salesInvoice.findMany({
      where: { deletedAt: null, status: { in: ["OPEN", "PARTIALLY_PAID", "OVERDUE"] } },
      take: 5, orderBy: { dueDate: "asc" },
      select: { id: true, documentNo: true, customerName: true, dueDate: true, grandTotal: true, paidAmount: true, status: true },
    }) : null,
    canCust && canInv ? getTopCustomers(startDate) : null,
    getNotifications(perms, startDate),
  ]);

  const revThis = revenue?._sum.amount ? Number(revenue._sum.amount) : 0;
  const revPrev = revenuePrev?._sum.amount ? Number(revenuePrev._sum.amount) : 0;

  return {
    kpis: {
      leads: leadCount,
      leadsTrend: leadCount !== null && leadPrev !== null ? leadCount - leadPrev : null,
      activeOpportunities: activeOpps,
      oppsValue: oppsValue?._sum.estimatedValue ? Number(oppsValue._sum.estimatedValue) : 0,
      customers: customerCount,
      customersTrend: customerCount !== null && customerPrev !== null ? customerCount - customerPrev : null,
      salesOrders: soCount,
      pendingInvoices: pendingInvCount,
      totalRevenue: revThis,
      revenueTrend: revThis - revPrev,
    },
    pipeline,
    revenueTrend,
    recentActivities: activities?.map((a) => ({
      id: a.id,
      action: a.action,
      entityType: a.entityType,
      entityId: a.entityId,
      userId: a.userId,
      label: `${ACTION_VERBS[a.action] ?? a.action.toLowerCase()} ${ENTITY_LABELS[a.entityType] ?? a.entityType}`,
      createdAt: a.createdAt.toISOString(),
    })),
    pendingInvoices: pendingList?.map((inv) => ({
      id: inv.id, documentNo: inv.documentNo, customerName: inv.customerName,
      dueDate: inv.dueDate.toISOString(),
      balance: Number(inv.grandTotal) - Number(inv.paidAmount),
      status: inv.status,
    })),
    topCustomers: topCust,
    notifications: notifs,
    permissions: {
      leads: canLeads, opportunities: canOpps, customers: canCust,
      salesOrders: canSO, invoices: canInv, payments: canPay,
      auditLogs: canAudit, quotations: canQuotes,
    },
  };
}

async function getPipeline(perms: string[], startDate: Date, isAdmin: boolean, userId: string) {
  const leadFilter = isAdmin ? {} : { assignedToId: userId };
  const [leads, opps, quotes, customers, sos] = await Promise.all([
    hasPermission(perms, "leads:read") ? prisma.lead.count({ where: { deletedAt: null, ...leadFilter } }) : 0,
    hasPermission(perms, "opportunities:read") ? prisma.opportunity.count({ where: { deletedAt: null } }) : 0,
    hasPermission(perms, "quotations:read") ? prisma.quotation.count({ where: { deletedAt: null } }) : 0,
    hasPermission(perms, "customers:read") ? prisma.customer.count({ where: { deletedAt: null } }) : 0,
    hasPermission(perms, "sales-orders:read") ? prisma.salesOrder.count({ where: { deletedAt: null } }) : 0,
  ]);
  return { leads, opportunities: opps, quotations: quotes, customers, salesOrders: sos };
}

async function getRevenueTrend(perms: string[], range: DateRange) {
  if (!hasPermission(perms, "payments:read")) return [];

  const now = new Date();

  const earliestPayment = await prisma.payment.findFirst({
    where: { deletedAt: null, status: "RECEIVED" },
    orderBy: { paymentDate: "asc" },
    select: { paymentDate: true },
  });

  const dataStart = earliestPayment?.paymentDate ?? now;

  let points: { label: string; start: Date; end: Date }[] = [];

  if (range === "today") {
    for (let i = 0; i < 24; i += 4) {
      const d = new Date(now); d.setHours(i, 0, 0, 0);
      const e = new Date(d); e.setHours(i + 4, 0, 0, 0);
      if (e >= dataStart) points.push({ label: `${i}h`, start: d, end: e });
    }
  } else if (range === "7d") {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const e = new Date(d); e.setDate(e.getDate() + 1);
      points.push({ label: d.toLocaleDateString("en-PH", { weekday: "short" }), start: d, end: e });
    }
  } else if (range === "30d") {
    for (let i = 3; i >= 0; i--) {
      const s = new Date(now); s.setDate(s.getDate() - (i + 1) * 7);
      const e = new Date(s); e.setDate(e.getDate() + 7);
      points.push({ label: `W${4 - i}`, start: s, end: e });
    }
  } else if (range === "month") {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfMonth = now.getDate();
    const bucketSize = Math.ceil(dayOfMonth / 4);
    for (let i = 0; i < 4; i++) {
      const s = new Date(monthStart); s.setDate(s.getDate() + i * bucketSize);
      const e = new Date(s); e.setDate(e.getDate() + bucketSize);
      if (s <= now) {
        points.push({ label: `${s.getMonth() + 1}/${s.getDate()}`, start: s, end: e });
      }
    }
  } else if (range === "year") {
    const yearMonths = [];
    const dataYearStart = new Date(dataStart.getFullYear(), dataStart.getMonth(), 1);
    let cursor = new Date(Math.max(dataYearStart.getTime(), new Date(now.getFullYear(), 0, 1).getTime()));
    while (cursor <= now) {
      const e = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
      yearMonths.push({
        label: cursor.toLocaleDateString("en-PH", { month: "short" }),
        start: new Date(cursor),
        end: e,
      });
      cursor = e;
    }
    points = yearMonths;
  } else {
    const dataYear = dataStart.getFullYear();
    const currentYear = now.getFullYear();
    if (dataYear === currentYear) {
      // Single year — use monthly buckets for meaningful trend
      let cursor = new Date(dataStart.getFullYear(), dataStart.getMonth(), 1);
      while (cursor <= now) {
        const e = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        points.push({
          label: cursor.toLocaleDateString("en-PH", { month: "short" }),
          start: new Date(cursor),
          end: e,
        });
        cursor = e;
      }
    } else {
      for (let y = dataYear; y <= currentYear; y++) {
        const s = new Date(y, 0, 1);
        const e = new Date(y + 1, 0, 1);
        points.push({ label: String(y), start: s, end: e });
      }
    }
  }

  if (points.length === 0) {
    const d = new Date(now); d.setHours(0, 0, 0, 0);
    const e = new Date(d); e.setDate(e.getDate() + 1);
    points.push({ label: "Today", start: d, end: e });
  }

  const payments = await prisma.payment.findMany({
    where: { deletedAt: null, status: "RECEIVED", paymentDate: { gte: points[0].start } },
    select: { amount: true, paymentDate: true },
  });

  return points.map((p) => {
    const value = payments
      .filter((pay) => pay.paymentDate >= p.start && pay.paymentDate < p.end)
      .reduce((s, pay) => s + Number(pay.amount), 0);
    return { label: p.label, value };
  });
}

async function getTopCustomers(startDate: Date) {
  const customers = await prisma.customer.findMany({
    where: { deletedAt: null },
    select: {
      id: true, name: true,
      invoices: { where: { deletedAt: null }, select: { grandTotal: true, paidAmount: true } },
      _count: { select: { salesOrders: { where: { deletedAt: null } } } },
    },
    take: 20,
  });
  return customers
    .map((c) => {
      const revenue = c.invoices.reduce((s, inv) => s + Number(inv.paidAmount), 0);
      const orders = c._count.salesOrders;
      return { id: c.id, name: c.name, revenue, orders, aov: orders > 0 ? Math.round(revenue / orders) : 0 };
    })
    .filter((c) => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
}

async function getNotifications(perms: string[], startDate: Date) {
  const notes: { type: string; message: string; severity: string; href?: string }[] = [];
  const [overdue, expiring, newLeads, recentPay] = await Promise.all([
    hasPermission(perms, "sales-invoices:read") ? prisma.salesInvoice.count({ where: { deletedAt: null, status: "OVERDUE" } }) : 0,
    hasPermission(perms, "quotations:read") ? prisma.quotation.count({ where: { deletedAt: null, status: "SENT", validUntil: { gte: new Date(), lt: new Date(Date.now() + 7 * 86400000) } } }) : 0,
    hasPermission(perms, "leads:read") ? prisma.lead.count({ where: { deletedAt: null, status: "NEW" } }) : 0,
    hasPermission(perms, "payments:read") ? prisma.payment.findFirst({ where: { deletedAt: null, status: "RECEIVED", createdAt: { gte: new Date(Date.now() - 86400000) } }, orderBy: { createdAt: "desc" }, select: { amount: true, customerName: true } }) : null,
  ]);
  if (overdue > 0) notes.push({ type: "overdue", message: `${overdue} overdue invoice${overdue > 1 ? "s" : ""}`, severity: "error", href: "/sales-invoices" });
  if (expiring > 0) notes.push({ type: "expiring", message: `${expiring} quotation${expiring > 1 ? "s" : ""} expiring soon`, severity: "warning", href: "/quotations" });
  if (newLeads > 0) notes.push({ type: "leads", message: `${newLeads} new lead${newLeads > 1 ? "s" : ""} uncontacted`, severity: "info", href: "/leads" });
  if (recentPay) notes.push({ type: "payment", message: `Payment received: ₱${Number(recentPay.amount).toLocaleString()}`, severity: "success", href: "/payments" });
  return notes;
}

export type DashboardData = NonNullable<Awaited<ReturnType<typeof getDashboardData>>>;
