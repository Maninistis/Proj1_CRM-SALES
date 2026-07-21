"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadUpdateSchema, type LeadUpdateInput } from "@/features/lead/schemas/lead-update";
import { updateLeadAction, type LeadActionState } from "@/features/lead/actions/lead-actions";
import { LEAD_SOURCE_OPTIONS } from "@/features/lead/constants";
import { buildItems, buildOptionItems } from "@/lib/select-helpers";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormValidationSummary } from "@/components/ui/form-validation-summary";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/forms/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UserOption = { id: string; name: string };

type LeadFormData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  source: string;
  assignedToId: string | null;
  notes: string | null;
};

export function LeadEditForm({
  lead,
  users,
}: {
  lead: LeadFormData;
  users: UserOption[];
}) {
  const [state, formAction] = useActionState<LeadActionState, FormData>(
    (prev, fd) => updateLeadAction(lead.id, prev, fd),
    { success: false }
  );

  const form = useForm<LeadUpdateInput>({
    resolver: zodResolver(leadUpdateSchema),
    defaultValues: {
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      company: lead.company ?? "",
      jobTitle: lead.jobTitle ?? "",
      source: lead.source as "WEBSITE" | "REFERRAL" | "COLD_CALL" | "EVENT" | "OTHER",
      assignedToId: lead.assignedToId ?? "",
      notes: lead.notes ?? "",
    },
  });

  return (
    <Card className="max-w-full">
      <CardHeader>
        <CardTitle>Edit Lead</CardTitle>
      </CardHeader>
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
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl><PhoneInput {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source *</FormLabel>
                    <Select name={field.name} items={buildOptionItems(LEAD_SOURCE_OPTIONS)} value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {LEAD_SOURCE_OPTIONS.map((opt) => (
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
                    <FormLabel>Assigned To *</FormLabel>
                    <Select name={field.name} items={buildItems(users)} value={field.value ?? undefined} onValueChange={field.onChange}>
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
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            <FormValidationSummary />
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
