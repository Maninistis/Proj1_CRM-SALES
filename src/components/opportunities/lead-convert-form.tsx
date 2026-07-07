"use client";

import { useActionState } from "react";
import { convertLeadAction, type OpportunityActionState } from "@/features/opportunity/actions/opportunity-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type LeadConvertFormProps = {
  leadId: string;
  leadName: string;
};

export function LeadConvertForm({ leadId, leadName }: LeadConvertFormProps) {
  const [state, formAction] = useActionState<OpportunityActionState, FormData>(
    (prev, fd) => convertLeadAction(leadId, prev, fd),
    { success: false }
  );

  const today = new Date();
  const defaultCloseDate = new Date(today.setMonth(today.getMonth() + 1))
    .toISOString()
    .split("T")[0];

  return (
    <Card className="max-w-2xl border-primary/30">
      <CardHeader>
        <CardTitle className="text-lg">Convert to Opportunity</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title">Opportunity Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder={`${leadName} — Enterprise Deal`}
              defaultValue={`${leadName} — New Opportunity`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="estimatedValue">Estimated Value *</Label>
              <Input
                id="estimatedValue"
                name="estimatedValue"
                type="number"
                min="0"
                step="0.01"
                placeholder="50000"
                defaultValue="0"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="expectedCloseDate">Expected Close Date *</Label>
              <Input
                id="expectedCloseDate"
                name="expectedCloseDate"
                type="date"
                defaultValue={defaultCloseDate}
              />
            </div>
          </div>
          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit">Convert Lead</Button>
        </form>
      </CardContent>
    </Card>
  );
}
