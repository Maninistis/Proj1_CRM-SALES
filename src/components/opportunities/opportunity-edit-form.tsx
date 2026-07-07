"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { opportunityUpdateSchema, type OpportunityUpdateInput } from "@/features/opportunity/schemas/opportunity-update";
import { updateOpportunityAction, type OpportunityActionState } from "@/features/opportunity/actions/opportunity-actions";
import { STAGE_OPTIONS } from "@/features/opportunity/constants";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UserOption = { id: string; name: string };

type OpportunityFormData = {
  id: string;
  title: string;
  description: string | null;
  estimatedValue: string;
  expectedCloseDate: string;
  stage: string;
  assignedToId: string | null;
  lossReason: string | null;
};

export function OpportunityEditForm({
  opp,
  users,
}: {
  opp: OpportunityFormData;
  users: UserOption[];
}) {
  const [state, formAction] = useActionState<OpportunityActionState, FormData>(
    (prev, fd) => updateOpportunityAction(opp.id, prev, fd),
    { success: false }
  );

  const dateStr = opp.expectedCloseDate
    ? new Date(opp.expectedCloseDate).toISOString().split("T")[0]
    : "";

  const form = useForm<OpportunityUpdateInput>({
    resolver: zodResolver(opportunityUpdateSchema),
    defaultValues: {
      title: opp.title,
      description: opp.description ?? "",
      estimatedValue: Number(opp.estimatedValue),
      expectedCloseDate: dateStr,
      stage: opp.stage as "PROSPECTING" | "QUALIFICATION" | "NEEDS_ANALYSIS" | "VALUE_PROPOSITION" | "NEGOTIATION",
      assignedToId: opp.assignedToId ?? "",
      lossReason: opp.lossReason ?? "",
    },
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Edit Opportunity</CardTitle></CardHeader>
      <CardContent>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
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
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="estimatedValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Value</FormLabel>
                    <FormControl><Input type="number" min="0" step="0.01" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedCloseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected Close Date</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {STAGE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
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
            </div>
            {opp.lossReason !== null && (
              <FormField
                control={form.control}
                name="lossReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loss Reason</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
