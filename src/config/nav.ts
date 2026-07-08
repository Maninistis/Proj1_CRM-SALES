import {
  LayoutDashboard,
  Users,
  Shield,
  ScrollText,
  Settings,
  UserPlus,
  TrendingUp,
  FileText,
  Package,
  Building2,
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
    label: "CRM",
    items: [
      {
        label: "Leads",
        href: "/leads",
        icon: UserPlus,
        permission: "leads:read",
      },
      {
        label: "Opportunities",
        href: "/opportunities",
        icon: TrendingUp,
        permission: "opportunities:read",
      },
      {
        label: "Quotations",
        href: "/quotations",
        icon: FileText,
        permission: "quotations:read",
      },
      {
        label: "Products",
        href: "/products",
        icon: Package,
        permission: "quotations:read",
      },
      {
        label: "Customers",
        href: "/customers",
        icon: Building2,
        permission: "customers:read",
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
