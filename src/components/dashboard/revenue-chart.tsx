import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

type Props = {
  data: { label: string; value: number }[];
};

export function RevenueChart({ data }: Props) {
  const nonZero = data.filter((d) => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);
  const count = nonZero.length;

  if (count === 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-[#0B2433]">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex h-44 flex-col items-center justify-center text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFC9A3]/30">
              <TrendingUp className="h-5 w-5 text-[#DF853A]" />
            </div>
            <p className="text-sm font-medium text-[#1E2328]">No revenue in this period</p>
            <p className="text-xs text-[#B7BEC6]">Revenue trend will appear as payments are recorded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (count === 1) {
    const point = nonZero[0];
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-[#0B2433]">Revenue Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex h-44 flex-col items-center justify-center">
            <div className="mb-1 text-xs font-medium text-[#787F87]">{point.label}</div>
            <div className="font-heading text-3xl font-bold text-[#2E8B57]">₱{point.value.toLocaleString()}</div>
            <div className="mt-2 rounded-full bg-[#E6EEDC] px-3 py-1 text-xs font-semibold text-[#2E8B57]">
              Collected this period
            </div>
            <p className="mt-3 text-xs text-[#B7BEC6]">Trend chart will appear as more data accumulates</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const max = Math.max(...data.map((d) => d.value));
  const avg = total / count;

  const points = data.map((d, i) => {
    const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50;
    const y = 100 - (d.value / max) * 70 - 15;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L 100 100 L 0 100 Z`;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold text-[#0B2433]">Revenue Trend</CardTitle>
        <div className="text-right">
          <span className="font-heading text-lg font-bold text-[#103447]">₱{total.toLocaleString()}</span>
          <p className="text-[10px] text-[#787F87]">avg ₱{Math.round(avg).toLocaleString()}/period</p>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative h-44 w-full">
          <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DF853A" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#DF853A" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[25, 50, 75].map((y) => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#E5DDD2" strokeWidth="0.3" strokeDasharray="1 2" />
            ))}
            {count >= 4 && <path d={areaPath} fill="url(#rev-grad)" />}
            <path d={linePath} fill="none" stroke="#DF853A" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            {points.map((p, i) =>
              p.value > 0 ? (
                <circle key={i} cx={p.x} cy={p.y} r="2" fill="#DF853A" stroke="#fff" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
              ) : null
            )}
          </svg>
          <div className="absolute inset-x-0 bottom-0 flex justify-between px-1">
            {data.map((d, i) => (
              <span key={i} className={`text-[10px] ${d.value > 0 ? "font-medium text-[#787F87]" : "text-[#B7BEC6]/50"}`}>
                {d.label}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
