"use client";

import { useActionState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { dnCreateSchema, type DNCreateInput } from "@/features/delivery-note/schemas/dn-create";
import { createDNAction, type DNActionState } from "@/features/delivery-note/actions/dn-actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormValidationSummary } from "@/components/ui/form-validation-summary";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrefillBanner } from "@/components/forms/prefill-banner";
import { Plus, Trash2 } from "lucide-react";

type SOItem = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  deliveredQuantity: string;
};

export function DNForm({ salesOrderId, soDocumentNo, soItems }: { salesOrderId: string; soDocumentNo: string; soItems: SOItem[] }) {
  const [state, formAction] = useActionState<DNActionState, FormData>(createDNAction, { success: false });

  const deliverableItems = soItems.filter((i) => Number(i.quantity) - Number(i.deliveredQuantity) > 0);

  const form = useForm<DNCreateInput>({
    resolver: zodResolver(dnCreateSchema),
    defaultValues: {
      salesOrderId,
      deliveryDate: "",
      carrier: "",
      trackingNumber: "",
      notes: "",
      items: deliverableItems.length > 0
        ? deliverableItems.map((i) => ({
            salesOrderItemId: i.id,
            description: i.description,
            quantity: Number(i.quantity) - Number(i.deliveredQuantity),
          }))
        : [{ salesOrderItemId: "", description: "", quantity: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  return (
    <Card className="max-w-3xl">
      <CardHeader><CardTitle>New Delivery Note — {soDocumentNo}</CardTitle></CardHeader>
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
            <PrefillBanner sourceLabel={`Sales Order #${soDocumentNo}`} targetLabel="Delivery Note" />
            <input type="hidden" name="salesOrderId" value={salesOrderId} />

            <div className="grid sm:grid-cols-3 gap-4">
              <FormField control={form.control} name="deliveryDate" render={({ field }) => (
                <FormItem><FormLabel>Delivery Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="carrier" render={({ field }) => (
                <FormItem><FormLabel>Carrier</FormLabel><FormControl><Input placeholder="LBC, JRS Express..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="trackingNumber" render={({ field }) => (
                <FormItem><FormLabel>Tracking #</FormLabel><FormControl><Input placeholder="TRK123456" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-heading text-sm font-semibold">Items to Deliver</h3>
              </div>
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-right">Remaining</th>
                      <th className="p-2 text-right">Deliver Qty</th>
                      <th className="p-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {fields.map((field, i) => {
                      const soItem = soItems.find((si) => si.id === form.watch(`items.${i}.salesOrderItemId`));
                      const remaining = soItem ? Number(soItem.quantity) - Number(soItem.deliveredQuantity) : 0;
                      return (
                        <tr key={field.id} className="border-t border-border">
                          <td className="p-2">
                            <input type="hidden" {...form.register(`items.${i}.salesOrderItemId`)} />
                            <input
                              className="flex h-8 w-full rounded border border-input px-2 text-sm"
                              {...form.register(`items.${i}.description`)}
                            />
                          </td>
                          <td className="p-2 text-right text-muted-foreground">{remaining}</td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0.01"
                              max={remaining}
                              step="0.01"
                              className="flex h-8 w-24 rounded border border-input px-2 text-right text-sm"
                              {...form.register(`items.${i}.quantity`)}
                            />
                          </td>
                          <td className="p-2">
                            {fields.length > 1 && (
                              <button type="button" onClick={() => remove(i)} className="text-destructive hover:text-destructive/80">
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

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea rows={2} {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <FormValidationSummary />
            <div className="flex gap-2">
              <Button type="submit">Create Delivery Note</Button>
              <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
