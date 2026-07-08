"use client";

import { Menu } from "lucide-react";

export function MobileMenuButton() {
  return (
    <button
      className="text-muted-foreground hover:text-foreground lg:hidden"
      onClick={() => {
        const btn = document.getElementById("sidebar-toggle") as HTMLButtonElement | null;
        btn?.click();
      }}
      aria-label="Toggle menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
