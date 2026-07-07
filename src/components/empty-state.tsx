import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center",
        className
      )}
    >
      {Icon && (
        <Icon className="mb-4 h-12 w-12 text-muted-foreground" />
      )}
      <h3 className="font-heading text-lg font-semibold text-navy-500">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      {action && (
        <a
          href={action.href}
          onClick={action.onClick}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-600"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}
