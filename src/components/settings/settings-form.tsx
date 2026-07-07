"use client";

import { updateSettingsAction, type SettingActionState } from "@/features/setting/actions/setting-actions";
import { useActionState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Setting = {
  id: string;
  key: string;
  value: string;
  category: string;
};

const inputClass = cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1",
  "text-sm shadow-sm transition-colors",
  "file:border-0 file:bg-transparent file:text-sm file:font-medium",
  "placeholder:text-muted-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:cursor-not-allowed disabled:opacity-50"
);

export function SettingsForm({ settings }: { settings: Setting[] }) {
  const [state, formAction] = useActionState<SettingActionState, FormData>(
    updateSettingsAction,
    { success: false }
  );

  const grouped = settings.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {} as Record<string, Setting[]>);

  return (
    <form action={formAction} className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((s) => (
              <div key={s.id} className="space-y-1">
                <input type="hidden" name="key" value={s.key} />
                <input type="hidden" name="category" value={s.category} />
                <Label htmlFor={`setting-${s.key}`} className="text-sm font-medium">
                  {s.key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </Label>
                {s.value.length > 60 ? (
                  <textarea
                    id={`setting-${s.key}`}
                    name="value"
                    defaultValue={s.value}
                    rows={3}
                    className={cn(inputClass, "resize-y")}
                  />
                ) : (
                  <input
                    id={`setting-${s.key}`}
                    name="value"
                    defaultValue={s.value}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-success">Settings saved successfully.</p>
      )}
      <Button type="submit">Save Settings</Button>
    </form>
  );
}
