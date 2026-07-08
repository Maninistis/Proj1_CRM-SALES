"use client";

import { useActionState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quotationUpdateSchema, type QuotationUpdateInput } from "@/features/quotation/schemas/quotation-update";
import { updateQuotationAction, type QuoteActionState } from "@/features/quotation/actions/quotation-actions";
import { computeAllTotals, calcLineTotal } from "@/features/quotation/calculations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { ProductDescriptionInput, type CatalogItem } from "@/components/quotations/product-description-input";

type QuoteFormData = {
  id: string;
  subject: string;
  validUntil: string;
  discountTotal: number;
  taxRate: number;
  notes: string;
  items: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
  }[];
};

export function QuotationEditForm({ quote, catalog }: { quote: QuoteFormData; catalog: CatalogItem[] }) {
  const [state, formAction] = useActionState<QuoteActionState, FormData>(
    (prev, fd) => updateQuotationAction(quote.id, prev, fd),
    { success: false }
  );

  const form = useForm<QuotationUpdateInput>({
    resolver: zodResolver(quotationUpdateSchema),
    defaultValues: {
      subject: quote.subject,
      validUntil: quote.validUntil,
      discountTotal: quote.discountTotal,
      taxRate: quote.taxRate,
      notes: quote.notes,
      items: quote.items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discountPercent: i.discountPercent,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedDiscount = form.watch("discountTotal");
  const watchedTaxRate = form.watch("taxRate");

  const totals = computeAllTotals(
    (watchedItems ?? []).map((i) => ({
      quantity: Number(i.quantity) || 0,
      unitPrice: Number(i.unitPrice) || 0,
      discountPercent: Number(i.discountPercent) || 0,
    })),
    Number(watchedDiscount) || 0,
    Number(watchedTaxRate) || 0
  );

  return (
    <Card className="max-w-full sm:max-w-4xl">
      <CardHeader><CardTitle>Edit Quotation</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form action={formAction} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valid Until *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discountTotal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount (whole quote)</FormLabel>
                    <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (0-1)</FormLabel>
                    <FormControl><Input type="number" min="0" max="1" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-heading text-sm font-semibold">Line Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ description: "", quantity: 1, unitPrice: 0, discountPercent: 0 })}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add Item
                </Button>
              </div>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-right">Qty</th>
                      <th className="p-2 text-right">Unit Price</th>
                      <th className="p-2 text-right">Disc %</th>
                      <th className="p-2 text-right">Line Total</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, i) => {
                      const item = (watchedItems ?? [])[i];
                      const lineTotal = calcLineTotal(
                        Number(item?.quantity) || 0,
                        Number(item?.unitPrice) || 0,
                        Number(item?.discountPercent) || 0
                      );
                      return (
                        <tr key={field.id} className="border-t border-border">
                          <td className="p-2">
                            <input
                              type="hidden"
                              {...form.register(`items.${i}.description`)}
                            />
                            <ProductDescriptionInput
                              catalog={catalog}
                              index={i}
                              defaultValue={item?.description ?? ""}
                              onDescriptionChange={(val) => form.setValue(`items.${i}.description`, val)}
                              onProductSelect={(_name, price) => form.setValue(`items.${i}.unitPrice`, price)}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              
                              type="number"
                              min="0.01"
                              step="0.01"
                              className="flex h-8 w-20 rounded border border-input px-2 text-right text-sm"
                              {...form.register(`items.${i}.quantity`)}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              
                              type="number"
                              min="0"
                              step="0.01"
                              className="flex h-8 w-28 rounded border border-input px-2 text-right text-sm"
                              {...form.register(`items.${i}.unitPrice`)}
                            />
                          </td>
                          <td className="p-2">
                            <input
                              
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              className="flex h-8 w-20 rounded border border-input px-2 text-right text-sm"
                              {...form.register(`items.${i}.discountPercent`)}
                            />
                          </td>
                          <td className="p-2 text-right font-medium">
                            ₱{lineTotal.toLocaleString()}
                          </td>
                          <td className="p-2">
                            {fields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => remove(i)}
                                className="text-destructive hover:text-destructive/80"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="ml-auto w-full sm:w-64 space-y-2 rounded-md border border-border bg-muted/50 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₱{totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-medium text-red-600">-₱{totals.discountTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">₱{totals.taxTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                <span>Grand Total</span>
                <span>₱{totals.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
