"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/features/sales-invoice/constants";
import type { ColumnDef } from "@tanstack/react-table";

type Inv = {
  id: string;
  documentNo: string;
  customer: { name: string } | null;
  status: string;
  grandTotal: string;
  paidAmount: string;
  dueDate: string;
};

const columns: ColumnDef<Inv>[] = [
  {
    accessorKey: "documentNo",
    header: "Invoice #",
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.documentNo}</span>,
  },
  {
    accessorKey: "customer.name",
    header: "Customer",
    cell: ({ row }) => (
      <Link href={`/sales-invoices/${row.original.id}`} className="font-medium text-primary hover:underline">
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
    accessorKey: "paidAmount",
    header: "Paid",
    cell: ({ row }) => {
      const paid = Number(row.original.paidAmount);
      const total = Number(row.original.grandTotal);
      return paid > 0 ? (
        <span className={paid >= total ? "font-medium text-green-600" : "font-medium text-yellow-600"}>
          ₱{paid.toLocaleString()}
        </span>
      ) : <span className="text-muted-foreground">—</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={
        row.original.status === "PAID" ? "default" :
        row.original.status === "OVERDUE" || row.original.status === "VOIDED" ? "destructive" : "secondary"
      }>
        {STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.dueDate).toLocaleDateString()}</span>,
  },
];

type Props = { data: Inv[]; page: number; pageSize: number; total: number; totalPages: number; search?: string };

export function InvoiceTable({ data, page, pageSize, total, totalPages, search }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      searchPlaceholder="Search invoices..."
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
      onRowClick={(row) => { window.location.href = `/sales-invoices/${row.id}`; }}
    />
  );
}
