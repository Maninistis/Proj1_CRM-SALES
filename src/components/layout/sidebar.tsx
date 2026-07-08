"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navGroups } from "@/config/nav";
import { hasPermission } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";

type SessionUser = { permissions: string[] };

export function Sidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasPermission(user.permissions, item.permission)),
    }))
    .filter((g) => g.items.length > 0);

  const navContent = (iconOnly: boolean) => (
    <nav className={cn("flex flex-col gap-4 p-2", iconOnly && "items-center")}>
      {filteredGroups.map((group) => (
        <div key={group.label} className="w-full">
          {!iconOnly && (
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={iconOnly ? item.label : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-colors",
                    iconOnly ? "h-10 w-10 justify-center" : "gap-3 px-3 py-2",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-navy-600 hover:bg-muted hover:text-navy-500"
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!iconOnly && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop: full sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-sidebar xl:block">
        <div className="flex h-16 items-center border-b border-border px-5">
          <span className="font-heading text-lg font-extrabold text-navy-500">CRM Sales</span>
        </div>
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">{navContent(false)}</div>
      </aside>

      {/* Tablet: icon-only sidebar */}
      <aside className="hidden w-16 shrink-0 border-r border-border bg-sidebar lg:block xl:hidden">
        <div className="flex h-16 items-center justify-center border-b border-border">
          <span className="font-heading text-sm font-extrabold text-primary">CS</span>
        </div>
        <div className="h-[calc(100vh-4rem)] overflow-y-auto">{navContent(true)}</div>
      </aside>

      {/* Mobile/Tablet drawer: triggered by hamburger in topbar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 border-r border-border bg-sidebar lg:hidden">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <span className="font-heading text-lg font-extrabold text-navy-500">CRM Sales</span>
              <button onClick={() => setMobileOpen(false)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
            <div className="h-[calc(100vh-4rem)] overflow-y-auto">{navContent(false)}</div>
          </aside>
        </>
      )}

      {/* Hidden trigger - exposed globally via a custom event */}
      <button
        id="sidebar-toggle"
        className="hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-hidden
      />
    </>
  );
}
