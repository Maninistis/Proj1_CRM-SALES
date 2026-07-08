import Link from "next/link";
import { findByIdIncludingDeleted } from "@/features/customer/repositories/customer.repository";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { STATUS_LABELS } from "@/features/customer/constants";
import { CustomerDetailActions } from "@/components/customers/customer-detail-actions";
import { notFound } from "next/navigation";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await findByIdIncludingDeleted(id);
  if (!customer) notFound();

  const isDeleted = !!customer.deletedAt;
  const billingAddress = customer.addresses.find((a) => a.type === "BILLING");
  const shippingAddress = customer.addresses.find((a) => a.type === "SHIPPING");

  return (
    <div className="space-y-6">
      <PageHeader title={customer.name} description={customer.documentNo}>
        {!isDeleted && (
          <Link href={`/customers/${id}/edit`} className={buttonVariants({ variant: "outline" })}>
            Edit
          </Link>
        )}
      </PageHeader>

      <div className="flex items-center gap-3">
        <Badge
          variant={
            customer.status === "ACTIVE" ? "default" :
            customer.status === "BLOCKED" ? "destructive" : "secondary"
          }
        >
          {STATUS_LABELS[customer.status] ?? customer.status}
        </Badge>
        {isDeleted && <Badge variant="destructive">Deleted</Badge>}
      </div>

      <CustomerDetailActions customerId={id} status={customer.status} isDeleted={isDeleted} />

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Company Info</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer #</span>
              <span className="font-mono text-xs">{customer.documentNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{customer.email || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{customer.phone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TIN / Tax ID</span>
              <span>{customer.taxId || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Website</span>
              <span>{customer.website || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Credit Limit</span>
              <span>{customer.creditLimit ? `₱${Number(customer.creditLimit).toLocaleString()}` : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Terms</span>
              <span>Net {customer.paymentTerms} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created By</span>
              <span>{customer.createdBy?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(customer.createdAt).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Addresses</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            {billingAddress ? (
              <div>
                <p className="mb-1 font-medium text-muted-foreground">Billing</p>
                <p>{billingAddress.line1}</p>
                {billingAddress.line2 && <p>{billingAddress.line2}</p>}
                <p>{billingAddress.city}{billingAddress.state ? `, ${billingAddress.state}` : ""} {billingAddress.postalCode}</p>
                <p>{billingAddress.country}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">No billing address on file.</p>
            )}
            {shippingAddress && (
              <div className="border-t border-border pt-3">
                <p className="mb-1 font-medium text-muted-foreground">Shipping</p>
                <p>{shippingAddress.line1}</p>
                {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
                <p>{shippingAddress.city}{shippingAddress.state ? `, ${shippingAddress.state}` : ""} {shippingAddress.postalCode}</p>
                <p>{shippingAddress.country}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {customer.contacts.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Contacts</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="pb-2 text-left">Name</th>
                  <th className="pb-2 text-left">Job Title</th>
                  <th className="pb-2 text-left">Email</th>
                  <th className="pb-2 text-left">Phone</th>
                  <th className="pb-2 text-center">Primary</th>
                </tr>
              </thead>
              <tbody>
                {customer.contacts.map((c) => (
                  <tr key={c.id} className="border-b border-border">
                    <td className="py-2 font-medium">{c.name}</td>
                    <td className="py-2 text-muted-foreground">{c.jobTitle || "—"}</td>
                    <td className="py-2">{c.email || "—"}</td>
                    <td className="py-2">{c.phone || "—"}</td>
                    <td className="py-2 text-center">{c.isPrimary && <Badge variant="default">★</Badge>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
