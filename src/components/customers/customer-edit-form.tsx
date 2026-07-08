"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerUpdateSchema, type CustomerUpdateInput } from "@/features/customer/schemas/customer-update";
import { updateCustomerAction, type CustomerActionState } from "@/features/customer/actions/customer-actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/forms/phone-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CustomerFormData = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  taxId: string | null;
  website: string | null;
  creditLimit: string | null;
  paymentTerms: number;
};

export function CustomerEditForm({ customer }: { customer: CustomerFormData }) {
  const [state, formAction] = useActionState<CustomerActionState, FormData>(
    (prev, fd) => updateCustomerAction(customer.id, prev, fd),
    { success: false }
  );

  const form = useForm<CustomerUpdateInput>({
    resolver: zodResolver(customerUpdateSchema),
    defaultValues: {
      name: customer.name,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      taxId: customer.taxId ?? "",
      website: customer.website ?? "",
      creditLimit: customer.creditLimit ? Number(customer.creditLimit) : undefined,
      paymentTerms: customer.paymentTerms,
    },
  });

  return (
    <Card className="max-w-full">
      <CardHeader><CardTitle>Edit Customer</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="taxId" render={({ field }) => (
                <FormItem><FormLabel>TIN / Tax ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="website" render={({ field }) => (
                <FormItem><FormLabel>Website</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="creditLimit" render={({ field }) => (
                <FormItem><FormLabel>Credit Limit (₱)</FormLabel><FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="paymentTerms" render={({ field }) => (
                <FormItem><FormLabel>Payment Terms (days)</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
