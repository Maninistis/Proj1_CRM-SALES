import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, TrendingUp, FileText, Building2, ShoppingCart, Receipt, Wallet, Truck, type LucideIcon } from "lucide-react";

type Props = {
  data: { leads: number; opportunities: number; quotations: number; customers: number; salesOrders: number; invoices: number; payments: number; deliveryNotes: number };
};

type Stage = { key: string; label: string; icon: LucideIcon; color: string; bg: string; border: string };

const stages: Stage[] = [
  { key: "leads", label: "Leads", icon: UserPlus, color: "#1A5366", bg: "#D6E6EE", border: "#1A536630" },
  { key: "opportunities", label: "Opportunities", icon: TrendingUp, color: "#2F6D7A", bg: "#D6E6EE", border: "#2F6D7A30" },
  { key: "quotations", label: "Quotations", icon: FileText, color: "#DF853A", bg: "#FFC9A320", border: "#DF853A30" },
  { key: "customers", label: "Customers", icon: Building2, color: "#6B8A7A", bg: "#E6EEDC", border: "#6B8A7A30" },
  { key: "salesOrders", label: "Sales Orders", icon: ShoppingCart, color: "#8A6446", bg: "#C7B59930", border: "#8A644630" },
  { key: "invoices", label: "Invoices", icon: Receipt, color: "#E3B04B", bg: "#E3B04B20", border: "#E3B04B30" },
  { key: "payments", label: "Payments", icon: Wallet, color: "#2E8B57", bg: "#2E8B5720", border: "#2E8B5730" },
  { key: "deliveryNotes", label: "Deliveries", icon: Truck, color: "#4A5560", bg: "#4A556020", border: "#4A556030" },
];

export function PipelineView({ data }: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[#0B2433]">Sales Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-2">
          {/* Connected workflow rows */}
          {stages.map((stage, i) => {
            const count = data[stage.key as keyof typeof data];
            const Icon = stage.icon;
            const isLast = i === stages.length - 1;
            return (
              <div key={stage.key}>
                <div className="flex items-center gap-3">
                  {/* Icon circle */}
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border"
                    style={{ backgroundColor: stage.bg, borderColor: stage.border }}
                  >
                    <Icon className="h-4 w-4" style={{ color: stage.color }} />
                  </div>

                  {/* Label */}
                  <div className="flex-1">
                    <span className="text-sm font-medium text-[#1E2328]">{stage.label}</span>
                  </div>

                  {/* Count */}
                  <div className="flex items-center gap-2">
                    <span
                      className="font-heading text-xl font-bold tabular-nums"
                      style={{ color: stage.color }}
                    >
                      {count}
                    </span>
                    <span className="text-xs text-[#787F87]">
                      {count === 1 ? "record" : "records"}
                    </span>
                  </div>
                </div>

                {/* Connector line */}
                {!isLast && (
                  <div className="ml-[18px] h-4 w-px bg-[#B7BEC6]" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
