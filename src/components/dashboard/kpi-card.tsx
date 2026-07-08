import Link from "next/link";
import { type LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: number | null;
  trendLabel?: string;
  href?: string;
  accent?: string;
};

export function KpiCard({ title, value, description, icon: Icon, trend, trendLabel, href, accent = "#DF853A" }: Props) {
  const content = (
    <div
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30"
      role={href ? "link" : undefined}
      tabIndex={href ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#787F87]">{title}</p>
          <p className="font-heading text-3xl font-bold leading-none text-[#103447]">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}15` }}>
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {trend !== null && trend !== undefined && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
              trend > 0
                ? "bg-[#E6EEDC] text-[#2E8B57]"
                : trend < 0
                  ? "bg-red-50 text-[#C84C4C]"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {trend > 0 ? <TrendingUp className="h-3 w-3" /> : trend < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {trend > 0 ? `+${trend}` : trend === 0 ? "0" : trend}
          </span>
        )}
        <p className="text-xs text-[#787F87]">{trendLabel ?? description}</p>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl">
      {content}
    </Link>
  ) : (
    content
  );
}
