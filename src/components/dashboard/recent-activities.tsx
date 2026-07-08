import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus, TrendingUp, FileText, Building2, ShoppingCart,
  Truck, Receipt, Wallet, User as UserIcon, Shield, Settings,
  type LucideIcon,
} from "lucide-react";

type Activity = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  label: string;
  createdAt: string;
};

type Props = {
  activities: Activity[] | null;
  userNames?: Record<string, string>;
};

const ENTITY_ICONS: Record<string, LucideIcon> = {
  Lead: UserPlus,
  Opportunity: TrendingUp,
  Quotation: FileText,
  Customer: Building2,
  SalesOrder: ShoppingCart,
  DeliveryNote: Truck,
  SalesInvoice: Receipt,
  Payment: Wallet,
  User: UserIcon,
  Role: Shield,
  Setting: Settings,
};

const ENTITY_COLORS: Record<string, string> = {
  Lead: "#1A5366",
  Opportunity: "#2F6D7A",
  Quotation: "#DF853A",
  Customer: "#6B8A7A",
  SalesOrder: "#8A6446",
  DeliveryNote: "#4A5560",
  SalesInvoice: "#E3B04B",
  Payment: "#2E8B57",
  User: "#1A5366",
  Role: "#1A5366",
  Setting: "#787F87",
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: "created",
  UPDATE: "updated",
  DELETE: "deleted",
  TRANSITION: "updated status of",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins === 1) return "1 minute ago";
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs === 1) return "1 hour ago";
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

export function RecentActivities({ activities, userNames = {} }: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[#0B2433]">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {activities && activities.length > 0 ? (
          <div className="max-h-[320px] space-y-1 overflow-y-auto pr-1">
            {activities.map((a) => {
              const Icon = ENTITY_ICONS[a.entityType] ?? UserIcon;
              const color = ENTITY_COLORS[a.entityType] ?? "#787F87";
              const action = ACTION_LABELS[a.action] ?? a.action.toLowerCase();
              const userName = userNames[a.userId] ?? "System";
              const shortId = a.entityId.slice(-6).toUpperCase();

              return (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted"
                >
                  {/* Entity icon */}
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug text-[#1E2328]">
                      <span className="font-semibold text-[#0B2433]">{userName}</span>{" "}
                      <span className="text-[#4A5560]">{action}</span>{" "}
                      <span className="font-medium text-[#1E2328]">{a.entityType}</span>{" "}
                      <span className="font-mono text-xs text-[#787F87]">#{shortId}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-[#B7BEC6]">{relativeTime(a.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-sm font-medium text-[#787F87]">No recent activity</p>
            <p className="text-xs text-[#B7BEC6]">Actions will appear here as they happen</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
