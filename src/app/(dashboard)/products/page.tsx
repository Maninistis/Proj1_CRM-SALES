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
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-sm capitalize">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="pb-2 text-left">Name</th>
                      <th className="pb-2 text-left">Description</th>
                      <th className="pb-2 text-right">Default Price</th>
                      <th className="pb-2 text-center">Status</th>
                      <th className="pb-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p.id} className="border-b border-border">
                        <td className="py-2 font-medium">{p.name}</td>
                        <td className="py-2 text-muted-foreground">{p.description || "—"}</td>
                        <td className="py-2 text-right font-medium">₱{Number(p.defaultPrice).toLocaleString()}</td>
                        <td className="py-2 text-center">
                          <Badge variant={p.isActive ? "default" : "secondary"}>
                            {p.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-2 text-right">
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
