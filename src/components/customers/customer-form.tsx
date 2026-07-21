"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerCreateSchema, type CustomerCreateInput } from "@/features/customer/schemas/customer-create";
import { createCustomerAction, type CustomerActionState } from "@/features/customer/actions/customer-actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormValidationSummary } from "@/components/ui/form-validation-summary";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/forms/money-input";
import { PhoneInput } from "@/components/forms/phone-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrefillBanner } from "@/components/forms/prefill-banner";

export function CustomerForm({
  prefill,
  returnTo,
}: {
  prefill?: { name?: string; email?: string; phone?: string; leadId?: string; sourceLabel?: string };
  returnTo?: string;
}) {
  const [state, formAction] = useActionState<CustomerActionState, FormData>(
    createCustomerAction,
    { success: false }
  );

  const form = useForm<CustomerCreateInput>({
    resolver: zodResolver(customerCreateSchema),
    defaultValues: {
      name: prefill?.name ?? "", email: prefill?.email ?? "", phone: prefill?.phone ?? "",
      taxId: "", website: "",
      paymentTerms: 30, billingCountry: "Philippines",
      billingLine1: "", billingLine2: "", billingCity: "",
      billingState: "", billingPostalCode: "",
    },
  });

  return (
    <Card className="max-w-full">
      <CardHeader><CardTitle>New Customer</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form
  action={async (fd) => {
    const valid = await form.trigger();
    if (!valid) return;
    await formAction(fd);
  }}
  noValidate
  className="space-y-4"
>
            {prefill?.leadId && (
              <input type="hidden" name="leadId" value={prefill.leadId} />
            )}
            {returnTo && (
              <input type="hidden" name="returnTo" value={returnTo} />
            )}
            {prefill?.sourceLabel && (
              <PrefillBanner sourceLabel={prefill.sourceLabel} targetLabel="Customer" />
            )}
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="Acme Corp" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email *</FormLabel><FormControl><Input type="email" placeholder="info@acme.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone *</FormLabel><FormControl><PhoneInput placeholder="+63 2 123 4567" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="taxId" render={({ field }) => (
              <FormItem><FormLabel>TIN / Tax ID *</FormLabel><FormControl><Input placeholder="123-456-789" {...field} onChange={(e) => { e.target.value = e.target.value.replace(/[^0-9-]/g, ""); field.onChange(e); }} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="acme.com" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="creditLimit" render={({ field }) => (
              <FormItem>
                <FormLabel>Credit Limit (₱) *</FormLabel>
                <FormControl><MoneyInput placeholder="500,000" {...field} /></FormControl>
                <p className="text-xs text-muted-foreground">Maximum unpaid balance before new orders are blocked.</p>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="paymentTerms" render={({ field }) => (
              <FormItem><FormLabel>Payment Terms (days) *</FormLabel><FormControl><Input type="number" min="0" placeholder="30" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            </div>

            <div className="rounded-md border border-border p-4">
              <h3 className="mb-3 font-heading text-sm font-semibold">Billing Address</h3>
              <div className="space-y-3">
                <FormField control={form.control} name="billingLine1" render={({ field }) => (
                  <FormItem><FormLabel>Address Line 1 *</FormLabel><FormControl><Input placeholder="123 Makati Ave" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="billingLine2" render={({ field }) => (
                  <FormItem><FormLabel>Address Line 2 *</FormLabel><FormControl><Input placeholder="Suite 200" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="billingCity" render={({ field }) => (
                    <FormItem><FormLabel>City *</FormLabel><FormControl><Input placeholder="Makati City" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="billingState" render={({ field }) => (
                    <FormItem><FormLabel>Province *</FormLabel><FormControl><Input placeholder="Metro Manila" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="billingPostalCode" render={({ field }) => (
                    <FormItem><FormLabel>Postal Code *</FormLabel><FormControl><Input placeholder="1200" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="billingCountry" render={({ field }) => (
                    <FormItem><FormLabel>Country *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>
            </div>

            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <FormValidationSummary />
            <div className="flex gap-2">
              <Button type="submit">Create Customer</Button>
              <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
