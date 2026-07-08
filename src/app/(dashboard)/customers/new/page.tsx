import { CustomerForm } from "@/components/customers/customer-form";
import { PageHeader } from "@/components/page-header";

export default async function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Customer" description="Add a new customer to your database" />
      <CustomerForm />
    </div>
  );
}
