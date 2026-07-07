"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";

type Role = {
  id: string;
  name: string;
  description: string | null;
  permissionCount: number;
  userCount: number;
};

const columns: ColumnDef<Role>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/roles/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original.description || "—",
  },
  {
    accessorKey: "permissionCount",
    header: "Permissions",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.permissionCount}</Badge>
    ),
  },
  {
    accessorKey: "userCount",
    header: "Users",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.userCount}</span>
    ),
  },
];

type RoleTableProps = {
  data: Role[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  search?: string;
};

export function RoleTable({ data, page, pageSize, total, totalPages, search }: RoleTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      searchPlaceholder="Search roles..."
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
        window.location.href = `/roles/${row.id}`;
      }}
    />
  );
}
