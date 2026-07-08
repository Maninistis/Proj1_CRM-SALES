import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, TrendingUp, Building2, ShoppingCart, Receipt, type LucideIcon } from "lucide-react";

type Props = {
  permissions: {
    leads: boolean;
    opportunities: boolean;
    customers: boolean;
    salesOrders: boolean;
    invoices: boolean;
  };
};

type Action = { label: string; href: string; icon: LucideIcon; show: boolean; primary?: boolean };

export function QuickActions({ permissions }: Props) {
  const actions: Action[] = [
    { label: "New Lead", href: "/leads/new", icon: UserPlus, show: permissions.leads, primary: true },
    { label: "New Opportunity", href: "/opportunities/new", icon: TrendingUp, show: permissions.opportunities },
    { label: "New Customer", href: "/customers/new", icon: Building2, show: permissions.customers },
    { label: "New Sales Order", href: "/sales-orders/new", icon: ShoppingCart, show: permissions.salesOrders },
    { label: "New Invoice", href: "/sales-invoices/new", icon: Receipt, show: permissions.invoices },
  ].filter((a) => a.show);

  if (actions.length === 0) return null;

  return (
    <Card className="overflow-hidden">
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
    </Card>
  );
}
