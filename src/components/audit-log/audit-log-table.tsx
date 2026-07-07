"use client";

import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";

type AuditLog = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  createdAt: string;
};

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleString()}
      </span>
    ),
  },
  { accessorKey: "entityType", header: "Entity" },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.original.action;
      const variant =
        action === "CREATE" ? "default" :
        action === "DELETE" ? "destructive" :
        action === "UPDATE" ? "secondary" :
        "outline";
      return <Badge variant={variant}>{action}</Badge>;
    },
  },
  {
    accessorKey: "entityId",
    header: "Entity ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.entityId.slice(0, 12)}...
      </span>
    ),
  },
  {
    accessorKey: "userId",
    header: "User ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.userId.slice(0, 12)}...
      </span>
    ),
  },
];

type AuditLogTableProps = {
  data: AuditLog[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function AuditLogTable({ data, page, pageSize, total, totalPages }: AuditLogTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      onPaginationChange={(p) => {
        const url = new URL(window.location.href);
        url.searchParams.set("page", String(p));
        window.location.href = url.toString();
      }}
    />
  );
}
