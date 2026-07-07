import { auth } from "@/lib/auth/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission } from "@/lib/auth/permissions";
import { Users, Shield, ScrollText, Settings } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  const cards = [
    {
      title: "Users",
      href: "/users",
      icon: Users,
      permission: "users:read",
      description: "Manage system users",
    },
    {
      title: "Roles",
      href: "/roles",
      icon: Shield,
      permission: "roles:read",
      description: "Manage roles & permissions",
    },
    {
      title: "Audit Logs",
      href: "/audit-logs",
      icon: ScrollText,
      permission: "audit-logs:read",
      description: "View change history",
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      permission: "settings:read",
      description: "System configuration",
    },
  ];

  const visibleCards = cards.filter((c) =>
    hasPermission(permissions, c.permission)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${session?.user?.name ?? "User"}`}
        description="CRM + Sales Management System"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleCards.map((card) => {
          const Icon = card.icon;
          return (
            <a key={card.href} href={card.href}>
              <Card className="transition-colors hover:border-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </a>
          );
        })}
      </div>
    </div>
  );
}
