"use client";

import { deleteProductAction } from "@/features/product/actions/product-actions";

export function DeleteProductButton({ productId }: { productId: string }) {
  return (
    <form action={async () => { await deleteProductAction(productId); }}>
      <button type="submit" className="text-xs text-destructive hover:underline">
        Delete
      </button>
    </form>
  );
}
