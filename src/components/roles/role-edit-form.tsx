"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleUpdateSchema, type RoleUpdateInput } from "@/features/role/schemas/role-update";
import { updateRoleAction, type RoleActionState } from "@/features/role/actions/role-actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

type Permission = { id: string; code: string; description: string | null };

type RoleEditFormProps = {
  role: {
    id: string;
    name: string;
    description: string;
    permissionIds: string[];
  };
  permissions: Permission[];
};

export function RoleEditForm({ role, permissions }: RoleEditFormProps) {
  const [state, formAction] = useActionState<RoleActionState, FormData>(
    (prev, fd) => updateRoleAction(role.id, prev, fd),
    { success: false }
  );

  const form = useForm<RoleUpdateInput>({
    resolver: zodResolver(roleUpdateSchema),
    defaultValues: {
      name: role.name,
      description: role.description,
      permissionIds: role.permissionIds,
    },
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(role.permissionIds)
  );

  const grouped = permissions.reduce((acc, p) => {
    const resource = p.code.split(":")[0];
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Edit Role</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form action={formAction} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Label className="mb-3 block">Permissions ({selectedIds.size} selected)</Label>
              <div className="max-h-80 space-y-4 overflow-y-auto rounded-md border border-border p-4">
                {Object.entries(grouped).map(([resource, perms]) => (
                  <div key={resource}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {resource}
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {perms.map((p) => {
                        const checked = selectedIds.has(p.id);
                        return (
                          <Label
                            key={p.id}
                            className="flex items-center gap-2 text-sm font-normal"
                          >
                            <Checkbox
                              name="permissionIds"
                              value={p.id}
                              checked={checked}
                              onCheckedChange={(val) => {
                                setSelectedIds((prev) => {
                                  const next = new Set(prev);
                                  if (val) next.add(p.id);
                                  else next.delete(p.id);
                                  return next;
                                });
                              }}
                            />
                            {p.code.split(":")[1]}
                          </Label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <div className="flex gap-2">
              <Button type="submit">Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => history.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
