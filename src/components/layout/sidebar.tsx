"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navGroups } from "@/config/nav";
import { hasPermission } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

type SessionUser = {
  permissions: string[];
};

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();

  const navContent = (
    <nav className="flex flex-col gap-6 p-4">
      {navGroups.map((group) => {
        const visibleItems = group.items.filter((item) =>
          hasPermission(user.permissions, item.permission)
        );
        if (visibleItems.length === 0) return null;

        return (
          <div key={group.label}>
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
            <div className="flex flex-col gap-1">
              {visibleItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-navy-600 hover:bg-muted hover:text-navy-500"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar md:block">
      <div className="flex h-16 items-center border-b border-border px-6">
        <span className="font-heading text-lg font-extrabold text-navy-500">
          CRM Sales
        </span>
      </div>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto">
        {navContent}
      </div>
    </aside>
  );
}
