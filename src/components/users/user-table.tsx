"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";

type User = {
  id: string;
  name: string;
  email: string;
  status: string;
  role: { name: string };
  createdAt: string;
};

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/users/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role.name", header: "Role" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "ACTIVE" ? "default" : "secondary"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </span>
    ),
  },
];

type UserTableProps = {
  data: User[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  search?: string;
};

export function UserTable({ data, page, pageSize, total, totalPages, search }: UserTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      searchPlaceholder="Search users..."
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
        window.location.href = `/users/${row.id}`;
      }}
    />
  );
}
