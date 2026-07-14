"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS, METHOD_LABELS } from "@/features/payment/constants";
import type { ColumnDef } from "@tanstack/react-table";

type Payment = {
  id: string;
  documentNo: string;
  customerName: string;
  amount: string;
  paymentMethod: string;
  status: string;
  paymentDate: string;
  referenceNumber: string | null;
  salesInvoice: { documentNo: string } | null;
};

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "documentNo",
    header: "PAY #",
    cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.documentNo}</span>,
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <Link href={`/payments/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.customerName}
      </Link>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <span className="font-medium text-green-600">₱{Number(row.original.amount).toLocaleString()}</span>,
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ row }) => <span className="text-sm">{METHOD_LABELS[row.original.paymentMethod] ?? row.original.paymentMethod}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "RECEIVED" ? "default" : row.original.status === "FAILED" || row.original.status === "CANCELLED" ? "destructive" : "secondary"} className={row.original.status === "RECEIVED" ? "border-transparent bg-[#103447] text-white" : ""}>
        {STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "salesInvoice.documentNo",
    header: "Invoice",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.salesInvoice?.documentNo ?? "—"}</span>,
  },
  {
    accessorKey: "paymentDate",
    header: "Date",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{new Date(row.original.paymentDate).toLocaleDateString()}</span>,
  },
];

type Props = { data: Payment[]; page: number; pageSize: number; total: number; totalPages: number; search?: string };

export function PaymentTable({ data, page, pageSize, total, totalPages, search }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      searchPlaceholder="Search payments..."
      searchValue={search}
      searchFields={(row) => `${row.documentNo} | ${row.customerName} | ${row.referenceNumber ?? ""} | ${row.salesInvoice?.documentNo ?? ""}`}
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
      onRowClick={(row) => { window.location.href = `/payments/${row.id}`; }}
    />
  );
}
