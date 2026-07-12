"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { LEAD_STATUS_LABELS } from "@/features/lead/constants";
import { DeleteLeadButton } from "@/components/leads/lead-action-buttons";
import type { ColumnDef } from "@tanstack/react-table";

type Lead = {
  id: string;
  documentNo: string;
  firstName: string;
  lastName: string;
  email: string | null;
  company: string | null;
  source: string;
  status: string;
  assignedTo: { name: string } | null;
  createdAt: string;
};

const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "documentNo",
    header: "Lead #",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.documentNo}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/leads/${row.original.id}`}
        className="font-medium text-primary hover:underline"
      >
        {row.original.firstName} {row.original.lastName}
      </Link>
    ),
  },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "company", header: "Company" },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.source}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary">
        {LEAD_STATUS_LABELS[row.original.status] ?? row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "assignedTo.name",
    header: "Assigned To",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.assignedTo?.name ?? "—"}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) =>
      row.original.status === "DISQUALIFIED" ? (
        <div onClick={(e) => e.stopPropagation()}>
          <DeleteLeadButton leadId={row.original.id} />
        </div>
      ) : null,
  },
];

type LeadTableProps = {
  data: Lead[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  search?: string;
};

export function LeadTable({
  data,
  page,
  pageSize,
  total,
  totalPages,
  search,
}: LeadTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      searchPlaceholder="Search leads..."
      searchValue={search}
      searchFields={(row) => `${row.firstName} ${row.lastName} | ${row.email ?? ""} | ${row.company ?? ""} | ${row.documentNo}`}
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
        window.location.href = `/leads/${row.id}`;
      }}
    />
  );
}
