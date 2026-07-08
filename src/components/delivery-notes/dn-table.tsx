"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/features/delivery-note/constants";
import type { ColumnDef } from "@tanstack/react-table";

type DN = {
  id: string;
  documentNo: string;
  status: string;
  deliveryDate: string | null;
  salesOrder: { documentNo: string; customer: { name: string } | null } | null;
};

const columns: ColumnDef<DN>[] = [
  {
    accessorKey: "documentNo",
    header: "DN #",
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.documentNo}</span>,
  },
  {
    accessorKey: "salesOrder.customer.name",
    header: "Customer",
    cell: ({ row }) => (
      <Link href={`/delivery-notes/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.salesOrder?.customer?.name ?? "—"}
      </Link>
    ),
  },
  {
    accessorKey: "salesOrder.documentNo",
    header: "Sales Order",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.salesOrder?.documentNo ?? "—"}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "CANCELLED" ? "destructive" : row.original.status === "DELIVERED" || row.original.status === "ACKNOWLEDGED" ? "default" : "secondary"}>
        {STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "deliveryDate",
    header: "Delivery Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.deliveryDate ? new Date(row.original.deliveryDate).toLocaleDateString() : "—"}
      </span>
    ),
  },
];

type Props = { data: DN[]; page: number; pageSize: number; total: number; totalPages: number; search?: string };

export function DNTable({ data, page, pageSize, total, totalPages, search }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      searchPlaceholder="Search delivery notes..."
      searchValue={search}
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
      onRowClick={(row) => { window.location.href = `/delivery-notes/${row.id}`; }}
    />
  );
}
