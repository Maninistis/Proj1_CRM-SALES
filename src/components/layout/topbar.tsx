"use client";

import {
  Search,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { getBreadcrumbs } from "@/config/page-meta";
import { MobileMenuButton } from "@/components/layout/mobile-menu-button";
import { TopbarNotifications } from "@/components/layout/topbar-notifications";
import { TopbarSystemMenu } from "@/components/layout/topbar-system-menu";
import { cn } from "@/lib/utils";
import { STAGE_LABELS } from "@/features/pipeline/types";
import type { PipelineSearchResult } from "@/features/pipeline/types";

const TYPE_ICON: Record<string, string> = {
  lead: "\u{1F465}",
  opportunity: "\u{1F4C8}",
  quotation: "\u{1F4DD}",
  customer: "\u{1F3E2}",
  "sales-order": "\u{1F6D2}",
  delivery: "\u{1F69A}",
  invoice: "\u{1F9FE}",
  payment: "\u{1F4B0}",
};

const RESULT_ROUTE: Record<string, string> = {
  lead: "/leads",
  opportunity: "/opportunities",
  quotation: "/quotations",
  customer: "/customers",
  "sales-order": "/sales-orders",
  delivery: "/delivery-notes",
  invoice: "/sales-invoices",
  payment: "/payments",
};

export function Topbar({ permissions }: { permissions: string[] }) {
  const pathname = usePathname();
  const crumbs = getBreadcrumbs(pathname);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored !== null) setSidebarCollapsed(stored === "true");

    const handler = (e: Event) =>
      setSidebarCollapsed((e as CustomEvent).detail as boolean);
    window.addEventListener("sidebar-state", handler);
    return () => window.removeEventListener("sidebar-state", handler);
  }, []);

  const toggleSidebar = () =>
    window.dispatchEvent(new CustomEvent("sidebar-toggle"));

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-3 sm:px-4 lg:px-6">
      <MobileMenuButton />

      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
      >
        {sidebarCollapsed ? (
          <PanelLeftOpen className="h-[18px] w-[18px]" />
        ) : (
          <PanelLeftClose className="h-[18px] w-[18px]" />
        )}
      </button>

      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={crumb.label} className="flex items-center gap-1.5">
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
              )}
              <span
                className={
                  isLast
                    ? "truncate text-sm font-medium text-foreground"
                    : "text-sm text-muted-foreground"
                }
              >
                {crumb.label}
              </span>
            </span>
          );
        })}
      </nav>

      <GlobalSearch />

      <div className="flex items-center gap-1">
        <TopbarNotifications />
        <TopbarSystemMenu permissions={permissions} />
      </div>
    </header>
  );
}

// ─── Global Search ──────────────────────────────────────────────────

function GlobalSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PipelineSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  // Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        e.stopPropagation();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
        setQuery("");
      }
    }
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pipeline/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setActiveIdx(-1);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navigateToResult = useCallback(
    (r: PipelineSearchResult) => {
      const base = RESULT_ROUTE[r.type] ?? "";
      if (base && r.id) router.push(`${base}/${r.id}`);
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    },
    [router]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      navigateToResult(results[activeIdx]);
    }
  }

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={containerRef} className="relative ml-auto hidden md:block lg:w-72 xl:w-80">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search customers, invoices..."
        aria-label="Global search"
        className="h-9 w-full rounded-lg border border-border bg-muted/50 pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:bg-card focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {loading && (
        <Loader2 className="absolute right-10 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
        Ctrl K
      </kbd>

      {showDropdown && (
        <div className="absolute z-50 mt-1.5 max-h-96 w-full overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          {!loading && results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results found
            </div>
          ) : (
            <ul className="py-1">
              {results.map((r, i) => (
                <li key={`${r.type}-${r.id}`}>
                  <button
                    onClick={() => navigateToResult(r)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-muted/50",
                      i === activeIdx && "bg-muted/50"
                    )}
                  >
                    <span className="text-base">{TYPE_ICON[r.type]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{r.label}</p>
                      {r.sublabel && (
                        <p className="truncate text-xs text-muted-foreground">{r.sublabel}</p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {STAGE_LABELS[r.type]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
