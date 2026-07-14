"use client";

import {
  restoreQuotationAction,
  deleteQuotationAction,
  transitionQuotationAction,
} from "@/features/quotation/actions/quotation-actions";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, Send, Check, X, FileText } from "lucide-react";

type Props = {
  quoteId: string;
  status: string;
  isDeleted: boolean;
};

export function QuotationDetailActions({ quoteId, status, isDeleted }: Props) {
  if (isDeleted) {
    return (
      <form action={async () => { await restoreQuotationAction(quoteId); }}>
        <Button type="submit" variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" /> Restore
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "DRAFT" && (
        <form action={async () => { await transitionQuotationAction(quoteId, "READY"); }}>
          <Button type="submit" variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" /> Mark Ready
          </Button>
        </form>
      )}

      {(status === "DRAFT" || status === "READY") && (
        <form action={async () => { await transitionQuotationAction(quoteId, "SENT"); }}>
          <Button type="submit" size="sm">
            <Send className="mr-2 h-4 w-4" /> Send to Customer
          </Button>
        </form>
      )}

      {status === "READY" && (
        <form action={async () => { await transitionQuotationAction(quoteId, "DRAFT"); }}>
          <Button type="submit" variant="outline" size="sm">Back to Draft</Button>
        </form>
      )}

      {status === "SENT" && (
        <>
          <form action={async () => { await transitionQuotationAction(quoteId, "ACCEPTED"); }}>
            <Button type="submit" size="sm" className="bg-green-600 text-white hover:bg-green-700">
              <Check className="mr-2 h-4 w-4" /> Accept
            </Button>
          </form>
          <form action={async () => { await transitionQuotationAction(quoteId, "REJECTED"); }}>
            <Button type="submit" variant="outline" size="sm" className="text-red-600">
              <X className="mr-2 h-4 w-4" /> Reject
            </Button>
          </form>
        </>
      )}

      {(status === "REJECTED" || status === "EXPIRED") && (
        <form action={async () => { await transitionQuotationAction(quoteId, "DRAFT"); }}>
          <Button type="submit" variant="outline" size="sm">Revise (Back to Draft)</Button>
        </form>
      )}

      <form action={async () => { await deleteQuotationAction(quoteId); }}>
        <Button type="submit" variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </Button>
      </form>
    </div>
  );
}
