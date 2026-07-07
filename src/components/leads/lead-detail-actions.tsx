"use client";

import { restoreLeadAction, deleteLeadAction, transitionLeadAction } from "@/features/lead/actions/lead-actions";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from "@/features/lead/constants";
import { LEAD_TRANSITIONS } from "@/features/lead/types";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw } from "lucide-react";

type LeadDetailActionsProps = {
  leadId: string;
  status: string;
  isDeleted: boolean;
};

export function LeadDetailActions({ leadId, status, isDeleted }: LeadDetailActionsProps) {
  if (isDeleted) {
    return (
      <form action={async () => { await restoreLeadAction(leadId); }}>
        <Button type="submit" variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" />
          Restore Lead
        </Button>
      </form>
    );
  }

  const allowedTransitions = LEAD_TRANSITIONS[status] ?? [];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {allowedTransitions.map((to) => (
        <form key={to} action={async () => { await transitionLeadAction(leadId, to); }}>
          <Button type="submit" variant="outline" size="sm">
            → {LEAD_STATUS_LABELS[to] ?? to}
          </Button>
        </form>
      ))}
      <form action={async () => { await deleteLeadAction(leadId); }}>
        <Button type="submit" variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </form>
    </div>
  );
}
