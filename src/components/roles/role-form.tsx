"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { roleCreateSchema, type RoleCreateInput } from "@/features/role/schemas/role-create";
import { createRoleAction, type RoleActionState } from "@/features/role/actions/role-actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type Permission = { id: string; code: string; description: string | null };

export function RoleForm({ permissions }: { permissions: Permission[] }) {
  const [state, formAction] = useActionState<RoleActionState, FormData>(
    createRoleAction,
    { success: false }
  );

  const form = useForm<RoleCreateInput>({
    resolver: zodResolver(roleCreateSchema),
    defaultValues: { name: "", description: "", permissionIds: [] },
  });

  const grouped = permissions.reduce((acc, p) => {
    const resource = p.code.split(":")[0];
    if (!acc[resource]) acc[resource] = [];
    acc[resource].push(p);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <Card className="max-w-full">
      <CardHeader>
        <CardTitle>New Role</CardTitle>
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
                    <Input placeholder="e.g. Sales Lead" {...field} />
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
                    <Textarea placeholder="What this role can do..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Label className="mb-3 block">Permissions</Label>
              <div className="max-h-80 space-y-4 overflow-y-auto rounded-md border border-border p-4">
                {Object.entries(grouped).map(([resource, perms]) => (
                  <div key={resource}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {resource}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2 sm:grid-cols-3">
                      {perms.map((p) => (
                        <Label
                          key={p.id}
                          className="flex items-center gap-2 text-sm font-normal"
                        >
                          <Checkbox name="permissionIds" value={p.id} />
                          {p.code.split(":")[1]}
                        </Label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <div className="flex gap-2">
              <Button type="submit">Create Role</Button>
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
