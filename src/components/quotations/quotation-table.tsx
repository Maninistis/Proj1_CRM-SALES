"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/features/quotation/constants";
import type { ColumnDef } from "@tanstack/react-table";

type Quotation = {
  id: string;
  documentNo: string;
  subject: string;
  status: string;
  grandTotal: string;
  currency: string;
  opportunity: { title: string } | null;
  validUntil: string;
  createdAt: string;
};

const columns: ColumnDef<Quotation>[] = [
  {
    accessorKey: "documentNo",
    header: "Quote #",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.documentNo}
      </span>
    ),
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <Link
        href={`/quotations/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.subject}
      </Link>
    ),
  },
  {
    accessorKey: "opportunity.title",
    header: "Opportunity",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.opportunity?.title ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "grandTotal",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.currency} {Number(row.original.grandTotal).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "validUntil",
    header: "Valid Until",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.validUntil).toLocaleDateString()}
      </span>
    ),
  },
];

type Props = {
  data: Quotation[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  search?: string;
};

export function QuotationTable({ data, page, pageSize, total, totalPages, search }: Props) {
  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      searchPlaceholder="Search quotations..."
      searchValue={search}
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
      onRowClick={(row) => {
        window.location.href = `/quotations/${row.id}`;
      }}
    />
  );
}
