"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Users",
  roles: "Roles",
  settings: "Settings",
  "audit-logs": "Audit Logs",
  new: "New",
  edit: "Edit",
};

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground">
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        const label =
          routeLabels[segment] ??
          (segment.length === 25 ? segment.slice(0, 8) + "..." : segment);

        return (
          <Fragment key={href}>
            {index > 0 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
            {isLast ? (
              <span className="font-medium text-navy-500">{label}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-primary"
              >
                {label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
