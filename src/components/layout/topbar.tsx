"use client";

import {
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getBreadcrumbs } from "@/config/page-meta";
import { MobileMenuButton } from "@/components/layout/mobile-menu-button";
import { TopbarNotifications } from "@/components/layout/topbar-notifications";
import { TopbarSystemMenu } from "@/components/layout/topbar-system-menu";
import { GlobalSearch } from "@/components/layout/global-search";

export function Topbar({ permissions }: { permissions: string[] }) {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setSidebarCollapsed(stored === "true");

    const handler = (e: Event) =>
      setSidebarCollapsed((e as CustomEvent).detail as boolean);
    window.addEventListener("sidebar-state", handler);
    return () => window.removeEventListener("sidebar-state", handler);
  }, []);

  const toggleSidebar = () =>
    window.dispatchEvent(new CustomEvent("sidebar-toggle"));

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-3 sm:px-4 lg:px-6">
      <MobileMenuButton />

      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="h-[18px] w-[18px]" />
        ) : (
          <PanelLeftClose className="h-[18px] w-[18px]" />
        )}
      </button>

      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={crumb.label} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
              )}
              <span
                className={
                  isLast
                    ? "truncate text-sm font-medium text-foreground"
                    : "text-sm text-muted-foreground"
                }
              >
                {crumb.label}
              </span>
            </span>
          );
        })}
      </nav>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-3 md:ml-0">
        <TopbarNotifications />
        <TopbarSystemMenu permissions={permissions} />
      </div>
    </header>
  );
}
