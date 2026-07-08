import Link from "next/link";
import { AlertTriangle, Clock, UserPlus, CheckCircle, type LucideIcon } from "lucide-react";

type Note = { type: string; message: string; severity: string; href?: string };
type Props = { notifications: Note[] };

const SEVERITY: Record<string, { icon: LucideIcon; color: string; bg: string; border: string }> = {
  error: { icon: AlertTriangle, color: "#C84C4C", bg: "#C84C4C0F", border: "#C84C4C25" },
  warning: { icon: Clock, color: "#A95A1E", bg: "#FFC9A320", border: "#FFC9A340" },
  info: { icon: UserPlus, color: "#1A5366", bg: "#D6E6EE40", border: "#D6E6EE60" },
  success: { icon: CheckCircle, color: "#2E8B57", bg: "#E6EEDC50", border: "#E6EEDC70" },
};

export function Notifications({ notifications }: Props) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {notifications.map((n, i) => {
        const cfg = SEVERITY[n.severity] ?? SEVERITY.info;
        const Icon = cfg.icon;
        const inner = (
          <div
            className="flex items-center gap-3 rounded-lg px-4 py-3 transition-transform hover:scale-[0.98]"
            style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${cfg.color}20` }}>
              <Icon className="h-4 w-4" style={{ color: cfg.color }} />
            </div>
            <p className="text-sm font-medium text-[#1E2328]">{n.message}</p>
          </div>
        );
        return n.href ? (
          <Link key={i} href={n.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg">
            {inner}
          </Link>
        ) : (
          <div key={i}>{inner}</div>
        );
      })}
    </div>
  );
}
