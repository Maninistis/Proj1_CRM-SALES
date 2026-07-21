"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userUpdateSchema, type UserUpdateInput } from "@/features/user/schemas/user-update";
import { updateUserAction, type UserActionState } from "@/features/user/actions/user-actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormValidationSummary } from "@/components/ui/form-validation-summary";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { buildOptionItems } from "@/lib/select-helpers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RoleWithPermissions } from "@/features/role/repositories/role.repository";

type UserFormData = {
  id: string;
  name: string;
  email: string;
  roleRoleId: string;
  status: string;
  role: { name: string };
};

export function UserEditForm({
  user,
  roles,
  canEditRole = true,
}: {
  user: UserFormData;
  roles: RoleWithPermissions[];
  canEditRole?: boolean;
}) {
  const [state, formAction] = useActionState<UserActionState, FormData>(
    (prev, fd) => updateUserAction(user.id, prev, fd),
    { success: false }
  );

  const form = useForm<UserUpdateInput>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      roleRoleId: user.roleRoleId,
      status: user.status as "ACTIVE" | "INACTIVE",
    },
  });

  return (
    <Card className="max-w-full">
      <CardHeader>
        <CardTitle>Edit User</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
  action={async (fd) => {
    const valid = await form.trigger();
    if (!valid) return;
    await formAction(fd);
  }}
  noValidate
  className="space-y-4"
>
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {canEditRole ? (
              <FormField
                control={form.control}
                name="roleRoleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select items={buildOptionItems(roles.map(r => ({value: r.id, label: r.name})))} value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <input type="hidden" name="roleRoleId" value={user.roleRoleId} />
                <div>
                  <FormLabel>Role</FormLabel>
                  <p className="text-sm text-muted-foreground">{user.role.name}</p>
                </div>
              </>
            )}
            {canEditRole ? (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select items={{"ACTIVE": "Active", "INACTIVE": "Inactive"}} value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <>
                <input type="hidden" name="status" value={user.status} />
                <div>
                  <FormLabel>Status</FormLabel>
                  <p className="text-sm text-muted-foreground">{user.status}</p>
                </div>
              </>
            )}
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <FormValidationSummary />
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
