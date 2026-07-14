"use client";

import {
  restoreCustomerAction,
  deleteCustomerAction,
  transitionCustomerAction,
} from "@/features/customer/actions/customer-actions";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, Check, X, Pause, Play } from "lucide-react";

type Props = {
  customerId: string;
  status: string;
  isDeleted: boolean;
  canDelete?: boolean;
};

export function CustomerDetailActions({ customerId, status, isDeleted, canDelete = true }: Props) {
  if (isDeleted) {
    return (
      <form action={async () => { await restoreCustomerAction(customerId); }}>
        <Button type="submit" variant="outline">
          <RotateCcw className="mr-2 h-4 w-4" /> Restore
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "NEW" && (
        <form action={async () => { await transitionCustomerAction(customerId, "ACTIVE"); }}>
          <Button type="submit" size="sm" className="bg-green-600 text-white hover:bg-green-700">
            <Check className="mr-2 h-4 w-4" /> Activate
          </Button>
        </form>
      )}

      {status === "ACTIVE" && (
        <>
          <form action={async () => { await transitionCustomerAction(customerId, "INACTIVE"); }}>
            <Button type="submit" variant="outline" size="sm">
              <Pause className="mr-2 h-4 w-4" /> Deactivate
            </Button>
          </form>
          <form action={async () => { await transitionCustomerAction(customerId, "BLOCKED"); }}>
            <Button type="submit" variant="outline" size="sm" className="text-red-600">
              <X className="mr-2 h-4 w-4" /> Block
            </Button>
          </form>
        </>
      )}

      {(status === "INACTIVE" || status === "BLOCKED") && (
        <form action={async () => { await transitionCustomerAction(customerId, "ACTIVE"); }}>
          <Button type="submit" size="sm" className="bg-green-600 text-white hover:bg-green-700">
            <Play className="mr-2 h-4 w-4" /> Reactivate
          </Button>
        </form>
      )}

      {canDelete && (
        <form action={async () => { await deleteCustomerAction(customerId); }}>
          <Button type="submit" variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </form>
      )}
    </div>
  );
}
