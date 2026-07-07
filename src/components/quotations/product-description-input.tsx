"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronsUpDown } from "lucide-react";

export type CatalogItem = {
  id: string;
  name: string;
  defaultPrice: number;
  category: string;
};

type Props = {
  catalog: CatalogItem[];
  index: number;
  defaultValue: string;
  onDescriptionChange: (value: string) => void;
  onProductSelect: (name: string, price: number) => void;
};

export function ProductDescriptionInput({
  catalog,
  index,
  defaultValue,
  onDescriptionChange,
  onProductSelect,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [value, setValue] = useState(defaultValue);
  const [filter, setFilter] = useState("");
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const filtered = catalog.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.category.toLowerCase().includes(filter.toLowerCase())
  );

  const grouped = filtered.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, CatalogItem[]>);

  function updatePosition() {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 280),
      });
    }
  }

  useEffect(() => {
    if (showDropdown) {
      updatePosition();
    }
  }, [showDropdown]);

  useEffect(() => {
    if (!showDropdown) return;
    function handleScroll() {
      updatePosition();
    }
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [showDropdown]);

  function handleSelect(product: CatalogItem) {
    setValue(product.name);
    onDescriptionChange(product.name);
    onProductSelect(product.name, product.defaultPrice);
    setShowDropdown(false);
    setFilter("");
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-1">
        <input
          className="flex h-8 w-full rounded border border-input px-2 text-sm"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onDescriptionChange(e.target.value);
          }}
          placeholder="Type or select..."
        />
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-input hover:bg-muted"
        >
          <ChevronsUpDown className="h-3 w-3" />
        </button>
      </div>

      {showDropdown && typeof document !== "undefined" && createPortal(
        <div
          style={{
            position: "fixed",
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
            zIndex: 9999,
          }}
          className="max-h-72 overflow-auto rounded-md border border-border bg-card shadow-xl"
        >
          <div className="sticky top-0 z-10 border-b border-border bg-card p-1.5">
            <input
              className="flex h-7 w-full rounded border border-input px-2 text-xs"
              placeholder="Search products..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              autoFocus
            />
          </div>
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <p className="bg-muted px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </p>
              {items.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelect(product)}
                  className="flex w-full items-center justify-between px-2 py-1.5 text-left text-sm hover:bg-muted"
                >
                  <span className="truncate pr-2">{product.name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    ₱{product.defaultPrice.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              No products found. Type manually.
            </p>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
