"use client";

import { convertOpportunityToCustomerAction } from "@/features/customer/actions/customer-actions";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export function ConvertToCustomerButton({ opportunityId }: { opportunityId: string }) {
  return (
    <form action={async () => { await convertOpportunityToCustomerAction(opportunityId); }}>
      <Button type="submit" variant="outline" size="sm">
        <Building2 className="mr-2 h-4 w-4" /> Create Customer
      </Button>
    </form>
  );
}
