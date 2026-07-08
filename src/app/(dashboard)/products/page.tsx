import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "@/components/products/product-form";
import { DeleteProductButton } from "@/components/products/delete-product-button";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const grouped = products.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, typeof products>);

  return (
    <div className="space-y-6">
      <PageHeader title="Products & Services" description="Manage your product catalog for quotations" />

      <ProductForm />

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No products yet. Add one above to use in quotations.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([category, items]) => (
            <Card key={category} className="w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm capitalize">{category}</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto p-2 sm:p-6">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="pb-2 pl-2 text-left sm:pl-0">Name</th>
                      <th className="hidden pb-2 text-left sm:table-cell md:lg:table-cell">Description</th>
                      <th className="pb-2 text-right">Price</th>
                      <th className="hidden pb-2 text-center sm:table-cell">Status</th>
                      <th className="pb-2 pr-2 sm:pr-0"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p.id} className="border-b border-border">
                        <td className="py-2 pl-2 font-medium sm:pl-0">
                          {p.name}
                          <span className="block text-xs text-muted-foreground sm:hidden">₱{Number(p.defaultPrice).toLocaleString()}</span>
                        </td>
                        <td className="hidden py-2 text-muted-foreground sm:table-cell">{p.description || "—"}</td>
                        <td className="hidden py-2 text-right font-medium sm:table-cell">₱{Number(p.defaultPrice).toLocaleString()}</td>
                        <td className="hidden py-2 text-center sm:table-cell">
                          <Badge variant={p.isActive ? "default" : "secondary"}>
                            {p.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-2 pr-2 text-right sm:pr-0">
                          <DeleteProductButton productId={p.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
