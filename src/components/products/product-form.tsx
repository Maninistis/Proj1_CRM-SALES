"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productCreateSchema, type ProductCreateInput } from "@/features/product/schemas/product-schema";
import { createProductAction, type ProductActionState } from "@/features/product/actions/product-actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormValidationSummary } from "@/components/ui/form-validation-summary";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProductForm() {
  const [state, formAction] = useActionState<ProductActionState, FormData>(
    createProductAction,
    { success: false }
  );

  const form = useForm<ProductCreateInput>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      defaultPrice: 0,
      category: "general",
    },
  });

  return (
    <Card className="max-w-full">
      <CardHeader><CardTitle>New Product / Service</CardTitle></CardHeader>
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
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl><Input placeholder="Enterprise License (annual)" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl><Input placeholder="software, service, hardware..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="defaultPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Price *</FormLabel>
                  <FormControl><Input type="number" min="0" step="0.01" placeholder="350.00" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={2} placeholder="Per user per year..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <FormValidationSummary />
            <Button type="submit">Create Product</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
