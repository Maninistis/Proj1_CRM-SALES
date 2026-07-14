"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentCreateSchema, type PaymentCreateInput } from "@/features/payment/schemas/payment-create";
import { createPaymentAction, type PaymentActionState } from "@/features/payment/actions/payment-actions";
import { METHOD_OPTIONS } from "@/features/payment/constants";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrefillBanner } from "@/components/forms/prefill-banner";

export function PaymentForm({
  invoiceId,
  invoiceNo,
  customerName,
  grandTotal,
  alreadyPaid,
}: {
  invoiceId: string;
  invoiceNo: string;
  customerName: string;
  grandTotal: number;
  alreadyPaid: number;
}) {
  const [state, formAction] = useActionState<PaymentActionState, FormData>(createPaymentAction, { success: false });
  const remaining = grandTotal - alreadyPaid;
  const today = new Date().toISOString().split("T")[0];

  const form = useForm<PaymentCreateInput>({
    resolver: zodResolver(paymentCreateSchema),
    defaultValues: {
      salesInvoiceId: invoiceId,
      amount: remaining,
      paymentMethod: "BANK_TRANSFER",
      referenceNumber: "",
      paymentDate: today,
      notes: "",
    },
  });

  return (
    <Card className="max-w-full">
      <CardHeader><CardTitle>Record Payment — {invoiceNo}</CardTitle></CardHeader>
      <CardContent>
        <div className="mb-4 rounded-md border border-border bg-muted/50 p-4 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium">{customerName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Invoice Total</span><span>₱{grandTotal.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Already Paid</span><span className="text-green-600">₱{alreadyPaid.toLocaleString()}</span></div>
          <div className="flex justify-between border-t border-border pt-2"><span className="font-medium">Remaining Balance</span><span className="font-bold text-red-600">₱{remaining.toLocaleString()}</span></div>
        </div>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <PrefillBanner sourceLabel={`Invoice #${invoiceNo}`} targetLabel="Payment" />
            <input type="hidden" name="salesInvoiceId" value={invoiceId} />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₱) *</FormLabel>
                  <FormControl><Input type="number" min="0.01" max={remaining} step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="paymentDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date *</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Payment Method *</label>
                <select name="paymentMethod" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" defaultValue="BANK_TRANSFER">
                  {METHOD_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <FormField control={form.control} name="referenceNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference #</FormLabel>
                  <FormControl><Input placeholder="Bank ref, check no, GCash ref..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl><Textarea rows={2} placeholder="Additional notes..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <div className="flex gap-2">
              <Button type="submit">Record Payment</Button>
              <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
