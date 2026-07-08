"use client";

import { deleteDNAction, restoreDNAction, transitionDNAction } from "@/features/delivery-note/actions/dn-actions";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, Send, Check, PackageCheck } from "lucide-react";

type Props = { dnId: string; status: string; isDeleted: boolean };

export function DNDetailActions({ dnId, status, isDeleted }: Props) {
  if (isDeleted) {
    return (
      <form action={async () => { await restoreDNAction(dnId); }}>
        <Button type="submit" variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> Restore</Button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "DRAFT" && (
        <form action={async () => { await transitionDNAction(dnId, "DISPATCHED"); }}>
          <Button type="submit" size="sm"><Send className="mr-2 h-4 w-4" /> Dispatch</Button>
        </form>
      )}
      {status === "DISPATCHED" && (
        <form action={async () => { await transitionDNAction(dnId, "DELIVERED"); }}>
          <Button type="submit" size="sm" className="bg-green-600 text-white hover:bg-green-700"><Check className="mr-2 h-4 w-4" /> Mark Delivered</Button>
        </form>
      )}
      {status === "DELIVERED" && (
        <form action={async () => { await transitionDNAction(dnId, "ACKNOWLEDGED"); }}>
          <Button type="submit" size="sm" variant="outline"><PackageCheck className="mr-2 h-4 w-4" /> Acknowledge</Button>
        </form>
      )}
      {(status === "DRAFT" || status === "DISPATCHED") && (
        <form action={async () => { await transitionDNAction(dnId, "CANCELLED"); }}>
          <Button type="submit" variant="outline" size="sm" className="text-red-600">Cancel</Button>
        </form>
      )}
      <form action={async () => { await deleteDNAction(dnId); }}>
        <Button type="submit" variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
      </form>
    </div>
  );
}
