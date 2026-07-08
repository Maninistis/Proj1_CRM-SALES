import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Invoice = { id: string; documentNo: string; customerName: string; dueDate: string; balance: number; status: string };
type Props = { invoices: Invoice[] | null };

function dueInfo(iso: string, status: string): { text: string; bg: string; text_color: string } {
  if (status === "PAID") return { text: "Paid", bg: "bg-[#E6EEDC]", text_color: "text-[#2E8B57]" };
  const due = new Date(iso);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return { text: `Overdue ${Math.abs(diff)}d`, bg: "bg-[#C84C4C]/10", text_color: "text-[#C84C4C]" };
  if (diff === 0) return { text: "Due today", bg: "bg-[#FFC9A3]/40", text_color: "text-[#A95A1E]" };
  if (diff === 1) return { text: "Due tomorrow", bg: "bg-[#FFC9A3]/30", text_color: "text-[#A95A1E]" };
  if (diff <= 7) return { text: `Due in ${diff}d`, bg: "bg-[#E3B04B]/15", text_color: "text-[#A95A1E]" };
  return { text: due.toLocaleDateString("en-PH", { month: "short", day: "numeric" }), bg: "bg-muted", text_color: "text-[#787F87]" };
}

export function PendingInvoices({ invoices }: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-[#0B2433]">Pending Invoices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 pt-0">
        {invoices && invoices.length > 0 ? (
          invoices.map((inv) => {
            const di = dueInfo(inv.dueDate, inv.status);
            return (
              <Link
                key={inv.id}
                href={`/sales-invoices/${inv.id}`}
                className="flex items-center justify-between rounded-lg border border-transparent px-3 py-2.5 transition-all hover:border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[#0B2433]">{inv.documentNo}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${di.bg} ${di.text_color}`}>{di.text}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-[#787F87]">{inv.customerName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-heading text-sm font-bold text-[#103447]">₱{inv.balance.toLocaleString()}</p>
                  <p className="text-[10px] text-[#B7BEC6]">outstanding</p>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <p className="text-sm font-medium text-[#787F87]">All invoices settled</p>
            <p className="text-xs text-[#B7BEC6]">No outstanding balances</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
