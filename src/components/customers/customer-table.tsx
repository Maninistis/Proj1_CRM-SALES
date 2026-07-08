"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/features/customer/constants";
import type { ColumnDef } from "@tanstack/react-table";

type Customer = {
  id: string;
  documentNo: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
};

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "documentNo",
    header: "Customer #",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">{row.original.documentNo}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/customers/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "phone", header: "Phone" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "ACTIVE" ? "default" :
          row.original.status === "BLOCKED" ? "destructive" : "secondary"
        }
      >
        {STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
];

type Props = {
  data: Customer[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  search?: string;
};

export function CustomerTable({ data, page, pageSize, total, totalPages, search }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      searchPlaceholder="Search customers..."
      searchValue={search}
      searchFields={(row) => `${row.name} | ${row.email ?? ""} | ${row.phone ?? ""} | ${row.documentNo}`}
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
      onRowClick={(row) => { window.location.href = `/customers/${row.id}`; }}
    />
  );
}
