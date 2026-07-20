"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { navGroups } from "@/config/nav";
import { hasPermission } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils";
import { SidebarProfile, type SidebarUserProfile } from "@/components/layout/sidebar-profile";
import { BusinessSwitcher } from "@/components/layout/business-switcher";

type SessionUser = { permissions: string[] };

type BusinessItem = {
  id: string;
  name: string;
  logoUrl: string | null;
};

const STORAGE_KEY = "sidebar-collapsed";

export function Sidebar({
  user,
  profile,
  businesses,
  currentBusinessId,
  currentBusinessName,
  canManageBusinesses,
  isGlobalView = false,
}: {
  user: SessionUser;
  profile: SidebarUserProfile;
  businesses: BusinessItem[];
  currentBusinessId: string | null;
  currentBusinessName: string;
  canManageBusinesses: boolean;
  isGlobalView?: boolean;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setCollapsed(stored === "true");
    } else if (window.innerWidth < 1280) {
      setCollapsed(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
      window.dispatchEvent(new CustomEvent("sidebar-state", { detail: collapsed }));
    }
  }, [collapsed, ready]);

  useEffect(() => {
    const handler = () => setCollapsed((prev) => !prev);
    window.addEventListener("sidebar-toggle", handler);
    return () => window.removeEventListener("sidebar-toggle", handler);
  }, []);

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (isGlobalView) {
          return (
            (item.href === "/dashboard" || item.href === "/pipeline") &&
            hasPermission(user.permissions, item.permission)
          );
        }
        return hasPermission(user.permissions, item.permission);
      }),
    }))
    .filter((g) => g.items.length > 0);

  const renderNav = (isCollapsed: boolean) => (
    <nav
      className={cn(
        "flex flex-col gap-5 p-3",
        isCollapsed && "items-center gap-4 px-2"
      )}
    >
      {filteredGroups.map((group) => (
        <div key={group.label} className="w-full">
          {!isCollapsed && (
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-white/35">
              {group.label}
            </p>
          )}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center rounded-lg text-sm transition-colors duration-150",
                    isCollapsed
                      ? "h-10 w-10 justify-center"
                      : "gap-2.5 px-3 py-2",
                    isActive
                      ? "bg-primary/15 font-semibold text-white"
                      : "font-medium text-white/80 hover:bg-sidebar-accent hover:text-white"
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
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
      {/* Desktop + Tablet: collapsible sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col overflow-hidden bg-sidebar lg:flex",
          ready && "transition-[width] duration-200 ease-in-out",
          collapsed ? "w-[72px]" : "w-[230px]"
        )}
      >
        {/* Business Switcher */}
        <BusinessSwitcher
          businesses={businesses}
          currentBusinessId={currentBusinessId}
          currentBusinessName={currentBusinessName}
          canManageBusinesses={canManageBusinesses}
          collapsed={collapsed}
        />

        {/* Navigation — scrolls independently when content exceeds viewport */}
        <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {renderNav(collapsed)}
        </div>

        {/* Profile dock */}
        <SidebarProfile user={profile} iconOnly={collapsed} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 flex h-full w-[230px] flex-col bg-sidebar lg:hidden">
            <div className="shrink-0">
              <BusinessSwitcher
                businesses={businesses}
                currentBusinessId={currentBusinessId}
                currentBusinessName={currentBusinessName}
                canManageBusinesses={canManageBusinesses}
              />
            </div>
            <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
              {renderNav(false)}
            </div>
            <SidebarProfile user={profile} />
          </aside>
        </>
      )}

      {/* Hidden trigger */}
      <button
        id="sidebar-toggle"
        className="hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-hidden
      />
    </>
  );
}
