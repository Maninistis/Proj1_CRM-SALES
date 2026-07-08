"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { STAGE_LABELS, STATUS_LABELS } from "@/features/opportunity/constants";
import type { ColumnDef } from "@tanstack/react-table";

type Opportunity = {
  id: string;
  documentNo: string;
  title: string;
  estimatedValue: string;
  stage: string;
  status: string;
  lead: { firstName: string; lastName: string } | null;
  assignedTo: { name: string } | null;
  expectedCloseDate: string;
  createdAt: string;
};

const columns: ColumnDef<Opportunity>[] = [
  {
    accessorKey: "documentNo",
    header: "Opp #",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.documentNo}
      </span>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/opportunities/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "lead",
    header: "Lead",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.lead
          ? `${row.original.lead.firstName} ${row.original.lead.lastName}`
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "estimatedValue",
    header: "Value",
    cell: ({ row }) => (
      <span className="font-medium">
        ₱{Number(row.original.estimatedValue).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "stage",
    header: "Stage",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {STAGE_LABELS[row.original.stage] ?? row.original.stage}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "CLOSED_WON"
            ? "default"
            : row.original.status === "CLOSED_LOST"
              ? "destructive"
              : "secondary"
        }
      >
        {STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "expectedCloseDate",
    header: "Close Date",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.expectedCloseDate).toLocaleDateString()}
      </span>
    ),
  },
];

type OpportunityTableProps = {
  data: Opportunity[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  search?: string;
};

export function OpportunityTable({
  data,
  page,
  pageSize,
  total,
  totalPages,
  search,
}: OpportunityTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      searchPlaceholder="Search opportunities..."
      searchValue={search}
      searchFields={(row) => `${row.title} | ${row.lead?.firstName ?? ""} ${row.lead?.lastName ?? ""} | ${row.documentNo}`}
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
        window.location.href = `/opportunities/${row.id}`;
      }}
    />
  );
}
