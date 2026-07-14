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
  ShoppingCart,
  Truck,
  Receipt,
  Wallet,
  Workflow,
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
      {
        label: "Pipeline Search",
        href: "/pipeline",
        icon: Workflow,
        permission: "leads:read",
      },
      {
        label: "Products & Services",
        href: "/products",
        icon: Package,
        permission: "quotations:read",
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
        label: "Customers",
        href: "/customers",
        icon: Building2,
        permission: "customers:read",
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        label: "Sales Orders",
        href: "/sales-orders",
        icon: ShoppingCart,
        permission: "sales-orders:read",
      },
      {
        label: "Invoices",
        href: "/sales-invoices",
        icon: Receipt,
        permission: "sales-invoices:read",
      },
      {
        label: "Payments",
        href: "/payments",
        icon: Wallet,
        permission: "payments:read",
      },
      {
        label: "Delivery Notes",
        href: "/delivery-notes",
        icon: Truck,
        permission: "delivery-notes:read",
      },
    ],
  },
];

export type SystemNavItem = NavItem & { description: string };

export const systemNavItems: SystemNavItem[] = [
  {
    label: "Users",
    href: "/users",
    icon: Users,
    permission: "users:read",
    description: "Manage application users",
  },
  {
    label: "Roles",
    href: "/roles",
    icon: Shield,
    permission: "roles:read",
    description: "Configure permissions",
  },
  {
    label: "Audit Logs",
    href: "/audit-logs",
    icon: ScrollText,
    permission: "audit-logs:read",
    description: "Review system activity",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    permission: "settings:read",
    description: "Configure application",
  },
  {
    label: "Document Settings",
    href: "/settings/documents",
    icon: FileText,
    permission: "settings:read",
    description: "Branding for invoices, quotations & documents",
  },
];
