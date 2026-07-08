"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

const RANGES = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

export function DateFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const current = searchParams.get("range") || "all";

  function setRange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("range");
    else params.set("range", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => setRange(r.value)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
            current === r.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          {r.label}
        </button>
      ))}
      {current !== "all" && (
        <button onClick={() => setRange("all")} className="rounded-md px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted">
          All
        </button>
      )}
    </div>
  );
}
