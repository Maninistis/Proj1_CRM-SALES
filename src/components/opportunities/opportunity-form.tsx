"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { opportunityCreateSchema, type OpportunityCreateInput } from "@/features/opportunity/schemas/opportunity-create";
import { createOpportunityAction, type OpportunityActionState } from "@/features/opportunity/actions/opportunity-actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormValidationSummary } from "@/components/ui/form-validation-summary";
import { buildItems, buildOptionItems } from "@/lib/select-helpers";
import { STAGE_OPTIONS } from "@/features/opportunity/constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrefillBanner } from "@/components/forms/prefill-banner";

type LeadOption = { id: string; label: string };
type UserOption = { id: string; name: string };

type Prefill = {
  leadId: string;
  title: string;
  assignedToId: string;
  sourceLabel: string;
};

export function OpportunityForm({ leads, users, prefill, currentUserId, canAssign }: { leads: LeadOption[]; users: UserOption[]; prefill?: Prefill; currentUserId: string; canAssign: boolean }) {
  const [state, formAction] = useActionState<OpportunityActionState, FormData>(
    createOpportunityAction,
    { success: false }
  );

  const form = useForm<OpportunityCreateInput>({
    resolver: zodResolver(opportunityCreateSchema),
    defaultValues: {
      leadId: prefill?.leadId ?? "",
      title: prefill?.title ?? "",
      description: "",
      estimatedValue: 0,
      expectedCloseDate: "",
      assignedToId: canAssign ? (prefill?.assignedToId ?? "") : currentUserId,
    },
  });

  return (
    <Card className="max-w-full">
      <CardHeader><CardTitle>New Opportunity</CardTitle></CardHeader>
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
            {prefill && <PrefillBanner sourceLabel={prefill.sourceLabel} targetLabel="Opportunity" />}
            <FormField
              control={form.control}
              name="leadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead *</FormLabel>
                  <Select items={leads.length > 0 ? buildItems(leads.map(l => ({id: l.id, name: l.label}))) : {}} onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a qualified lead" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {leads.map((l) => (
                        <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl><Input placeholder="Enterprise software deal" {...field} /></FormControl>
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
                  <FormControl><Textarea placeholder="Opportunity details..." rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Value *</FormLabel>
                    <FormControl><Input type="number" min="0" step="0.01" placeholder="50000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedCloseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Close Date *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {canAssign ? (
              <FormField
                control={form.control}
                name="assignedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <Select items={buildItems(users.map(u => ({ id: u.id, name: u.name })))} onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <input type="hidden" name="assignedToId" value={currentUserId} />
            )}
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <FormValidationSummary />
            <div className="flex gap-2">
              <Button type="submit">Create Opportunity</Button>
              <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
