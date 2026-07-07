import {
  LayoutDashboard,
  Users,
  Shield,
  ScrollText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        permission: "dashboard:read",
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        label: "Users",
        href: "/users",
        icon: Users,
        permission: "users:read",
      },
      {
        label: "Roles",
        href: "/roles",
        icon: Shield,
        permission: "roles:read",
      },
      {
        label: "Audit Logs",
        href: "/audit-logs",
        icon: ScrollText,
        permission: "audit-logs:read",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        permission: "settings:read",
      },
    ],
  },
];
