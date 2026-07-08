import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";

type Customer = { id: string; name: string; revenue: number; orders: number; aov: number };
type Props = { customers: Customer[] | null };

export function TopCustomers({ customers }: Props) {
  const maxRev = customers && customers.length > 0 ? customers[0].revenue : 1;
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[#0B2433]">Top Customers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {customers && customers.length > 0 ? (
          customers.map((c, i) => {
            const isTop = i === 0;
            return (
              <Link
                key={c.id}
                href={`/customers/${c.id}`}
                className={`block rounded-lg px-3 py-2.5 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isTop ? "bg-card" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isTop ? "bg-[#E3B04B] text-white" : "bg-[#0B2433] text-white"
                    }`}
                  >
                    {isTop ? <Crown className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm ${isTop ? "font-bold text-[#0B2433]" : "font-medium text-[#1E2328]"}`}>{c.name}</span>
                      <span className="shrink-0 font-heading text-sm font-bold text-[#2E8B57]">₱{c.revenue.toLocaleString()}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#F1EBE3]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max((c.revenue / maxRev) * 100, 5)}%`,
                          backgroundColor: isTop ? "#E3B04B" : "#6B8A7A",
                        }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-xs text-[#787F87]">
                      <span>{c.orders} orders</span>
                      <span>AOV ₱{c.aov.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-sm font-medium text-[#787F87]">No revenue data yet</p>
            <p className="text-xs text-[#B7BEC6]">Top customers appear as payments are recorded</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
