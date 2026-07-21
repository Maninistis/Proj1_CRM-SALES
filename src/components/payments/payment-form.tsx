"use client";

import { useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentCreateSchema, type PaymentCreateInput } from "@/features/payment/schemas/payment-create";
import { createPaymentAction, type PaymentActionState } from "@/features/payment/actions/payment-actions";
import { METHOD_OPTIONS } from "@/features/payment/constants";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormValidationSummary } from "@/components/ui/form-validation-summary";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/forms/money-input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrefillBanner } from "@/components/forms/prefill-banner";
import { Upload, Loader2, X } from "lucide-react";

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
  const [proofUrl, setProofUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
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
      proofImageUrl: "",
      notes: "",
    },
  });

  const method = form.watch("paymentMethod");
  const isCash = method === "CASH";

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/payment-proof", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setProofUrl(data.url);
      form.setValue("proofImageUrl", data.url, { shouldValidate: true });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

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
          <form
  action={async (fd) => {
    const valid = await form.trigger();
    if (!valid) return;
    await formAction(fd);
  }}
  noValidate
  className="space-y-4"
>
            <PrefillBanner sourceLabel={`Invoice #${invoiceNo}`} targetLabel="Payment" />
            <input type="hidden" name="salesInvoiceId" value={invoiceId} />
            <input type="hidden" name="proofImageUrl" value={proofUrl} />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₱) *</FormLabel>
                  <FormControl><MoneyInput placeholder="50,000" {...field} /></FormControl>
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
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" defaultValue="BANK_TRANSFER" {...form.register("paymentMethod")}>
                  {METHOD_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <FormField control={form.control} name="referenceNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference #{!isCash ? " *" : ""}</FormLabel>
                  <FormControl><Input placeholder="Bank ref, check no, GCash ref..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Proof of Payment{!isCash ? " *" : ""}</label>
              {proofUrl ? (
                <div className="flex items-center gap-3 rounded-md border border-input p-3">
                  <img src={proofUrl} alt="Proof" className="h-16 w-16 rounded object-cover" />
                  <span className="flex-1 text-sm text-muted-foreground">{proofUrl.split("/").pop()}</span>
                  <button type="button" onClick={() => { setProofUrl(""); form.setValue("proofImageUrl", "", { shouldValidate: true }); }} className="text-destructive hover:text-destructive/80">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Uploading..." : "Click to upload proof of payment (JPG, PNG)"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              )}
              {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
              {form.formState.errors.proofImageUrl && (
                <p className="text-xs text-destructive">{form.formState.errors.proofImageUrl.message}</p>
              )}
            </div>

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl><Textarea rows={2} placeholder="Additional notes..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <FormValidationSummary />
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
