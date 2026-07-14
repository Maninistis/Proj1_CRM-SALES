"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  data: { label: string; value: number }[];
};

const CHART_H = 300;
const PAD_L = 54;
const PAD_R = 16;
const PAD_T = 20;
const PAD_B = 28;

function fmtAxis(n: number): string {
  if (n >= 1_000_000) return `\u20b1${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `\u20b1${Math.round(n / 1_000)}K`;
  return `\u20b1${n}`;
}

function fmtFull(n: number): string {
  return `\u20b1${Math.round(n).toLocaleString("en-US")}`;
}

function niceStep(val: number): number {
  if (val <= 0) return 1;
  const exp = Math.floor(Math.log10(val));
  const f = val / Math.pow(10, exp);
  const nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  return nf * Math.pow(10, exp);
}

function niceTicks(max: number, count = 5): number[] {
  if (max <= 0) return [0];
  const step = niceStep(max / count);
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.5; v += step) ticks.push(Math.round(v));
  return ticks;
}

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function RevenueChart({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(600);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width;
      if (cw && cw > 0) setW(cw);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const nonZero = data.filter((d) => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);

  const growth = (() => {
    if (data.length < 2) return null;
    const mid = Math.floor(data.length / 2);
    const first = data.slice(0, mid).reduce((s, d) => s + d.value, 0);
    const second = data.slice(mid).reduce((s, d) => s + d.value, 0);
    if (first === 0) return second > 0 ? 100 : null;
    return ((second - first) / first) * 100;
  })();

  if (nonZero.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="py-8">
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFC9A3]/30">
              <TrendingUp className="h-6 w-6 text-[#DF853A]" />
            </div>
            <p className="text-sm font-medium text-[#1E2328]">No revenue in this period</p>
            <p className="mt-1 text-xs text-[#B7BEC6]">Revenue trend will appear once more payments are recorded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (nonZero.length === 1) {
    const point = nonZero[0];
    return (
      <Card className="overflow-hidden">
        <CardContent className="py-8">
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-[#0B2433]">Revenue Trend</p>
            <p className="mt-3 font-heading text-3xl font-bold text-[#2E8B57]">{fmtFull(point.value)}</p>
            <p className="mt-1 text-xs text-[#787F87]">{point.label}</p>
            <p className="mt-4 text-xs text-[#B7BEC6]">Trend chart will appear as more data accumulates</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartW = Math.max(w - PAD_L - PAD_R, 50);
  const chartH = CHART_H - PAD_T - PAD_B;
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const ticks = niceTicks(maxVal, 5);
  const tickMax = ticks[ticks.length - 1] || maxVal;

  const pts = data.map((d, i) => ({
    x: PAD_L + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2),
    y: PAD_T + chartH - (d.value / tickMax) * chartH,
    label: d.label,
    value: d.value,
  }));

  const linePath = smoothPath(pts);
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(PAD_T + chartH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(PAD_T + chartH).toFixed(1)} Z`;

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-5">
        {/* Header */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-[#0B2433]">Revenue Trend</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-heading text-2xl font-bold text-[#103447]">{fmtFull(total)}</span>
            {growth !== null && (
              <span className={`flex items-center gap-1 text-sm font-semibold ${growth >= 0 ? "text-green-600" : "text-red-500"}`}>
                {growth >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
                <span className="font-normal text-muted-foreground">vs previous period</span>
              </span>
            )}
          </div>
        </div>

        {/* Chart */}
        <div ref={containerRef} className="relative w-full" style={{ height: CHART_H }}>
          <svg width={w} height={CHART_H}>
            <defs>
              <linearGradient id="rev-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DF853A" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#DF853A" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Gridlines + Y labels */}
            {ticks.map((tick) => {
              const y = PAD_T + chartH - (tick / tickMax) * chartH;
              return (
                <g key={tick}>
                  <line x1={PAD_L} y1={y} x2={w - PAD_R} y2={y} stroke="#E5E7EB" strokeWidth="1" />
                  <text x={PAD_L - 8} y={y + 4} textAnchor="end" className="fill-[#9CA3AF]" style={{ fontSize: 10 }}>
                    {fmtAxis(tick)}
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            <path
              d={areaPath}
              fill="url(#rev-area)"
              style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease-out 0.3s" }}
            />

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="#DF853A"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{
                strokeDasharray: 3000,
                strokeDashoffset: mounted ? 0 : 3000,
                transition: "stroke-dashoffset 1.2s ease-out",
              }}
            />

            {/* Hover guide line */}
            {hoverIdx !== null && pts[hoverIdx] && (
              <line
                x1={pts[hoverIdx].x}
                y1={PAD_T}
                x2={pts[hoverIdx].x}
                y2={PAD_T + chartH}
                stroke="#DF853A"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.4"
              />
            )}

            {/* Data points */}
            {pts.map((p, i) => (
              <g key={i}>
                {p.value > 0 && (
                  <>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="16"
                      fill="transparent"
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(null)}
                    />
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={hoverIdx === i ? 5 : 3.5}
                      fill="#DF853A"
                      stroke="#fff"
                      strokeWidth="2"
                      style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.3s ease-out 0.8s, r 0.15s" }}
                    />
                  </>
                )}
                <text x={p.x} y={CHART_H - 8} textAnchor="middle" className="fill-[#9CA3AF]" style={{ fontSize: 10 }}>
                  {p.label}
                </text>
              </g>
            ))}
          </svg>

          {/* Tooltip */}
          {hoverIdx !== null && pts[hoverIdx] && pts[hoverIdx].value > 0 && (
            <div
              className="pointer-events-none absolute z-10 rounded-lg border border-border bg-card px-3 py-2 shadow-lg"
              style={{
                left: Math.min(Math.max(pts[hoverIdx].x - 60, 4), w - 128),
                top: Math.max(pts[hoverIdx].y - 72, 4),
              }}
            >
              <p className="text-xs font-medium text-muted-foreground">{pts[hoverIdx].label}</p>
              <p className="text-sm font-bold text-[#103447]">{fmtFull(pts[hoverIdx].value)}</p>
              {hoverIdx > 0 && pts[hoverIdx - 1].value > 0 && (
                <p className="text-xs font-semibold text-green-600">
                  +{(((pts[hoverIdx].value - pts[hoverIdx - 1].value) / pts[hoverIdx - 1].value) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
