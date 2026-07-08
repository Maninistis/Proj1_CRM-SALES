"use client";

import { useActionState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceCreateSchema, type InvoiceCreateInput } from "@/features/sales-invoice/schemas/invoice-create";
import { createInvoiceAction, type InvActionState } from "@/features/sales-invoice/actions/invoice-actions";
import { computeAllTotals, calcLineTotal } from "@/features/quotation/calculations";
import { ProductDescriptionInput, type CatalogItem } from "@/components/quotations/product-description-input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function InvoiceForm({ salesOrderId, soDocumentNo, customerName, defaultTaxRate, catalog }: {
  salesOrderId: string;
  soDocumentNo: string;
  customerName: string;
  defaultTaxRate: number;
  catalog: CatalogItem[];
}) {
  const [state, formAction] = useActionState<InvActionState, FormData>(createInvoiceAction, { success: false });
  const today = new Date().toISOString().split("T")[0];
  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const form = useForm<InvoiceCreateInput>({
    resolver: zodResolver(invoiceCreateSchema),
    defaultValues: {
      salesOrderId,
      issueDate: today,
      dueDate,
      discountTotal: 0,
      taxRate: defaultTaxRate,
      notes: "",
      items: [{ description: "", quantity: 1, unitPrice: 0, discountPercent: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const watchedItems = form.watch("items");
  const watchedDiscount = form.watch("discountTotal");
  const watchedTaxRate = form.watch("taxRate");

  const totals = computeAllTotals(
    watchedItems.map((i) => ({ quantity: Number(i.quantity) || 0, unitPrice: Number(i.unitPrice) || 0, discountPercent: Number(i.discountPercent) || 0 })),
    Number(watchedDiscount) || 0,
    Number(watchedTaxRate) || 0
  );

  return (
    <Card className="max-w-full sm:max-w-4xl">
      <CardHeader><CardTitle>New Invoice — {soDocumentNo} ({customerName})</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="salesOrderId" value={salesOrderId} />
            <div className="grid sm:grid-cols-3 gap-4">
              <FormField control={form.control} name="issueDate" render={({ field }) => (
                <FormItem><FormLabel>Issue Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dueDate" render={({ field }) => (
                <FormItem><FormLabel>Due Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="taxRate" render={({ field }) => (
                <FormItem><FormLabel>VAT Rate (0-1)</FormLabel><FormControl><Input type="number" min="0" max="1" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-heading text-sm font-semibold">Line Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ description: "", quantity: 1, unitPrice: 0, discountPercent: 0 })}>
                  <Plus className="mr-1 h-4 w-4" /> Add Item
                </Button>
              </div>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted"><tr>
                    <th className="p-2 text-left">Description</th><th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Unit Price</th><th className="p-2 text-right">Disc %</th>
                    <th className="p-2 text-right">Line Total</th><th className="p-2"></th>
                  </tr></thead>
                  <tbody>
                    {fields.map((field, i) => {
                      const item = watchedItems[i];
                      const lineTotal = calcLineTotal(Number(item?.quantity) || 0, Number(item?.unitPrice) || 0, Number(item?.discountPercent) || 0);
                      return (
                        <tr key={field.id} className="border-t border-border">
                          <td className="p-2">
                            <input type="hidden" {...form.register(`items.${i}.description`)} />
                            <ProductDescriptionInput catalog={catalog} index={i} defaultValue={item?.description ?? ""}
                              onDescriptionChange={(val) => form.setValue(`items.${i}.description`, val)}
                              onProductSelect={(_n, price) => form.setValue(`items.${i}.unitPrice`, price)} />
                          </td>
                          <td className="p-2"><input type="number" min="0.01" step="0.01" className="flex h-8 w-20 rounded border border-input px-2 text-right text-sm" {...form.register(`items.${i}.quantity`)} /></td>
                          <td className="p-2"><input type="number" min="0" step="0.01" className="flex h-8 w-28 rounded border border-input px-2 text-right text-sm" {...form.register(`items.${i}.unitPrice`)} /></td>
                          <td className="p-2"><input type="number" min="0" max="100" step="0.01" className="flex h-8 w-20 rounded border border-input px-2 text-right text-sm" {...form.register(`items.${i}.discountPercent`)} /></td>
                          <td className="p-2 text-right font-medium">₱{lineTotal.toLocaleString()}</td>
                          <td className="p-2">{fields.length > 1 && <button type="button" onClick={() => remove(i)} className="text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="ml-auto w-full sm:w-64 space-y-2 rounded-md border border-border bg-muted/50 p-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">₱{totals.subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="font-medium text-red-600">-₱{totals.discountTotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">VAT</span><span className="font-medium">₱{totals.taxTotal.toLocaleString()}</span></div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><span>Grand Total</span><span>₱{totals.grandTotal.toLocaleString()}</span></div>
            </div>

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <div className="flex gap-2">
              <Button type="submit">Create Invoice</Button>
              <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
