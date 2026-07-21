"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/features/sales-order/constants";
import type { ColumnDef } from "@tanstack/react-table";

type SO = {
  id: string;
  documentNo: string;
  customer: { name: string } | null;
  status: string;
  grandTotal: string;
  orderDate: string;
};

const columns: ColumnDef<SO>[] = [
  {
    accessorKey: "documentNo",
    header: "SO #",
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.documentNo}</span>,
  },
  {
    accessorKey: "customer.name",
    header: "Customer",
    cell: ({ row }) => (
      <Link href={`/sales-orders/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.customer?.name ?? "—"}
      </Link>
    ),
  },
  {
    accessorKey: "grandTotal",
    header: "Total",
    cell: ({ row }) => <span className="font-medium">₱{Number(row.original.grandTotal).toLocaleString()}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "CANCELLED" ? "destructive" : row.original.status === "COMPLETED" ? "default" : row.original.status === "DELIVERED" ? "default" : "secondary"}>
        {STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "orderDate",
    header: "Order Date",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.orderDate).toLocaleDateString()}</span>,
  },
];

type Props = { data: SO[]; page: number; pageSize: number; total: number; totalPages: number; search?: string };

export function SOTable({ data, page, pageSize, total, totalPages, search }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      searchPlaceholder="Search sales orders..."
      searchValue={search}
      searchFields={(row) => `${row.documentNo} | ${row.customer?.name ?? ""}`}
      onSearchChange={(v) => {
        const url = new URL(window.location.href);
        if (v) url.searchParams.set("search", v); else url.searchParams.delete("search");
        url.searchParams.set("page", "1");
        window.location.href = url.toString();
      }}
      onPaginationChange={(p) => {
        const url = new URL(window.location.href);
        url.searchParams.set("page", String(p));
        window.location.href = url.toString();
      }}
      onRowClick={(row) => { window.location.href = `/sales-orders/${row.id}`; }}
    />
  );
}
