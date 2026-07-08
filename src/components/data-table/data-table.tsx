"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { useState, useRef, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, X, Loader2 } from "lucide-react";

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onPaginationChange?: (page: number) => void;
  onRowClick?: (row: TData) => void;
  searchFields?: (row: TData) => string;
};

const DEBOUNCE_MS = 450;

export function DataTable<TData, TValue>({
  columns,
  data,
  page,
  pageSize,
  total,
  totalPages,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  onPaginationChange,
  onRowClick,
  searchFields,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [inputValue, setInputValue] = useState(searchValue ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(searchValue ?? "");
  }, [searchValue]);

  useEffect(() => {
    if (!showSuggestions) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSuggestions]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      onSearchChange?.(inputValue);
      setShowSuggestions(false);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  function clearSearch() {
    setInputValue("");
    onSearchChange?.("");
    setShowSuggestions(false);
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    manualPagination: true,
    pageCount: totalPages,
  });

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const suggestions = searchFields && inputValue.length > 0
    ? data
        .filter((row) =>
          searchFields(row).toLowerCase().includes(inputValue.toLowerCase())
        )
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-4">
      {onSearchChange && (
        <div ref={containerRef} className="relative max-w-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => inputValue && setShowSuggestions(true)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent py-1 pl-8 pr-8 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {inputValue ? (
                <button
                  onClick={clearSearch}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-[9999] mt-1 w-full overflow-hidden rounded-md border border-border bg-card shadow-xl">
              {suggestions.map((suggestion, i) => {
                const fields = searchFields!(suggestion);
                const match = fields.toLowerCase().includes(inputValue.toLowerCase())
                  ? fields
                  : "";
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const firstField = fields.split(" | ")[0];
                      setInputValue(firstField);
                      setShowSuggestions(false);
                      onSearchChange?.(firstField);
                    }}
                    className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted"
                  >
                    <Search className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="truncate">{match}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      <div className="rounded-md border border-border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total > 0 ? `Showing ${start}-${end} of ${total}` : "No results"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPaginationChange?.(page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPaginationChange?.(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
