"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";

type AuditLog = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userName?: string;
  createdAt: string;
};

const ACTION_VARIANTS: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
  CREATE: "default",
  DELETE: "destructive",
  UPDATE: "secondary",
  TRANSITION: "outline",
};

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
      </span>
    ),
  },
  { accessorKey: "entityType", header: "Entity" },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Badge variant={ACTION_VARIANTS[row.original.action] ?? "outline"}>
        {row.original.action}
      </Badge>
    ),
  },
  {
    id: "user",
    header: "User",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.userName ?? "System"}</span>
    ),
  },
];

type Props = {
  data: AuditLog[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  search?: string;
};

export function AuditLogTable({ data, page, pageSize, total, totalPages, search }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      searchPlaceholder="Search audit logs..."
      searchValue={search}
      searchFields={(row) => `${row.action} ${row.entityType} ${row.entityId} ${row.userName ?? ""}`}
      onSearchChange={(v) => {
        const url = new URL(window.location.href);
        if (v) url.searchParams.set("search", v);
        else url.searchParams.delete("search");
        url.searchParams.set("page", "1");
        window.location.href = url.toString();
      }}
      onPaginationChange={(p) => {
        const url = new URL(window.location.href);
        url.searchParams.set("page", String(p));
        window.location.href = url.toString();
      }}
    />
  );
}
