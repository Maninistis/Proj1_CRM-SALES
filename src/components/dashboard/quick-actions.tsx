import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  UserPlus, TrendingUp, Building2, ShoppingCart, Receipt,
  Rocket, Settings, Package, CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import type { OnboardingStatus } from "@/features/dashboard/services/onboarding.service";

type Permissions = {
  leads: boolean;
  opportunities: boolean;
  customers: boolean;
  salesOrders: boolean;
  invoices: boolean;
};

type Action = { label: string; href: string; icon: LucideIcon; show: boolean; primary?: boolean };

type Props = {
  permissions: Permissions;
  onboarding?: OnboardingStatus | null;
};

// ---- Operational quick actions (shown once onboarding is complete) ----
function OperationalActions({ permissions }: { permissions: Permissions }) {
  const actions: Action[] = [
    { label: "New Lead", href: "/leads/new", icon: UserPlus, show: permissions.leads, primary: true },
    { label: "New Opportunity", href: "/opportunities/new", icon: TrendingUp, show: permissions.opportunities },
    { label: "New Customer", href: "/customers/new", icon: Building2, show: permissions.customers },
    { label: "New Sales Order", href: "/sales-orders/new", icon: ShoppingCart, show: permissions.salesOrders },
    { label: "New Invoice", href: "/sales-invoices/new", icon: Receipt, show: permissions.invoices },
  ].filter((a) => a.show);

  if (actions.length === 0) return null;

  return (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[#0B2433]">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid sm:grid-cols-2 gap-2 sm:grid-cols-3">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  a.primary
                    ? "border-transparent bg-[#DF853A] text-white hover:bg-[#C76E26]"
                    : "border-border bg-card text-[#0B2433] hover:border-[#DF853A]/40 hover:bg-card"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{a.label}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </>
  );
}

// ---- Getting Started onboarding tasks ----
type Task = {
  key: keyof OnboardingStatus["tasks"];
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  buttonLabel: string;
};

const ONBOARDING_TASKS: Task[] = [
  {
    key: "docSettings",
    title: "Configure Company Profile",
    description: "Complete your company branding and document settings.",
    href: "/settings/documents",
    icon: Settings,
    buttonLabel: "Go to Document Settings",
  },
  {
    key: "firstLead",
    title: "Create Your First Lead",
    description: "Add your first lead to start building your sales pipeline.",
    href: "/leads",
    icon: UserPlus,
    buttonLabel: "Go to Leads",
  },
  {
    key: "firstProduct",
    title: "Add Products & Services",
    description: "Create products or services that can be quoted and sold.",
    href: "/products",
    icon: Package,
    buttonLabel: "Go to Products & Services",
  },
];

function GettingStarted({ onboarding }: { onboarding: OnboardingStatus }) {
  const percent = Math.round((onboarding.completed / onboarding.total) * 100);

  return (
    <>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#0B2433]">
          <Rocket className="h-4 w-4 text-[#DF853A]" />
          Getting Started
        </CardTitle>
        <p className="text-xs text-[#787F87]">
          Complete these steps to begin using your CRM.
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#0B2433]">
              {onboarding.completed} of {onboarding.total} completed
            </span>
            <span className="font-semibold text-[#DF853A]">{percent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#103447]/10">
            <div
              className="h-full rounded-full bg-[#DF853A] transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-2.5">
          {ONBOARDING_TASKS.map((task) => {
            const done = onboarding.tasks[task.key];
            const Icon = task.icon;
            return (
              <div
                key={task.key}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 transition-colors",
                  done
                    ? "border-green-200 bg-green-50/60"
                    : "border-border bg-card"
                )}
              >
                {/* Icon / check */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    done ? "bg-green-100" : "bg-[#103447]/8"
                  )}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Icon className="h-4 w-4 text-[#103447]" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#0B2433]">{task.title}</p>
                  {done ? (
                    <p className="text-xs font-medium text-green-600">Completed</p>
                  ) : (
                    <p className="text-xs text-[#787F87]">{task.description}</p>
                  )}
                </div>

                {/* Action */}
                {!done && (
                  <Link
                    href={task.href}
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "sm" }),
                      "shrink-0"
                    )}
                  >
                    {task.buttonLabel}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </>
  );
}

export function QuickActions({ permissions, onboarding }: Props) {
  const showOnboarding = onboarding && !onboarding.isComplete;

  return (
    <Card className="overflow-hidden">
      {showOnboarding ? (
        <GettingStarted onboarding={onboarding} />
      ) : (
        <OperationalActions permissions={permissions} />
      )}
    </Card>
  );
}
