"use client";

import {
  restoreOpportunityAction,
  deleteOpportunityAction,
  advanceStageAction,
  closeWonAction,
  closeLostAction,
  reopenAction,
} from "@/features/opportunity/actions/opportunity-actions";
import { STAGE_LABELS } from "@/features/opportunity/constants";
import { getNextStage } from "@/features/opportunity/types";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, ArrowRight, Trophy, X, RefreshCw } from "lucide-react";

type Props = {
  oppId: string;
  stage: string;
  status: string;
  isDeleted: boolean;
};

export function OpportunityDetailActions({ oppId, stage, status, isDeleted }: Props) {
  if (isDeleted) {
    return (
      <form action={async () => { await restoreOpportunityAction(oppId); }}>
        <Button type="submit" variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" /> Restore
        </Button>
      </form>
    );
  }

  const nextStage = getNextStage(stage);
  const isOpen = status === "OPEN";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isOpen && nextStage && (
        <form action={async () => { await advanceStageAction(oppId); }}>
          <Button type="submit" variant="outline" size="sm">
            <ArrowRight className="mr-2 h-4 w-4" />
            Advance to {STAGE_LABELS[nextStage] ?? nextStage}
          </Button>
        </form>
      )}

      {isOpen && stage === "NEGOTIATION" && (
        <form action={async () => { await closeWonAction(oppId); }}>
          <Button type="submit" size="sm" className="bg-green-600 text-white hover:bg-green-700">
            <Trophy className="mr-2 h-4 w-4" /> Close Won
          </Button>
        </form>
      )}

      {isOpen && (
        <form action={async () => { await closeLostAction(oppId); }}>
          <Button type="submit" variant="outline" size="sm" className="text-red-600">
            <X className="mr-2 h-4 w-4" /> Close Lost
          </Button>
        </form>
      )}

      {status === "CLOSED_LOST" && (
        <form action={async () => { await reopenAction(oppId); }}>
          <Button type="submit" variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" /> Re-open
          </Button>
        </form>
      )}

      <form action={async () => { await deleteOpportunityAction(oppId); }}>
        <Button type="submit" variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </form>
    </div>
  );
}
