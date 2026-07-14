"use client";

import { useActionState, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userCreateSchema, type UserCreateInput } from "@/features/user/schemas/user-create";
import { createUserAction, type UserActionState } from "@/features/user/actions/user-actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { buildOptionItems } from "@/lib/select-helpers";
import { cn } from "@/lib/utils";
import { Upload, Loader2, X, Eye, EyeOff, Check } from "lucide-react";
import type { RoleWithPermissions } from "@/features/role/repositories/role.repository";

type ManagerOption = { id: string; name: string };

const ROLE_DESCRIPTIONS: Record<string, string> = {
  "Sales Manager": "Can oversee all customer workflows, approve transactions, assign work, and manage the sales team.",
  "Sales Rep": "Can manage assigned leads, customers, quotations, invoices, payments, and deliveries.",
};

function passwordStrength(pwd: string): { score: number; label: string; color: string } {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const config = [
    { label: "", color: "" },
    { label: "Very Weak", color: "bg-red-500" },
    { label: "Weak", color: "bg-red-400" },
    { label: "Fair", color: "bg-orange-400" },
    { label: "Good", color: "bg-yellow-500" },
    { label: "Strong", color: "bg-green-500" },
    { label: "Excellent", color: "bg-green-600" },
  ];
  return { score, ...config[Math.min(score, 6)] };
}

export function UserForm({
  roles,
  managers,
  lockRoleToRep = false,
  repRoleId,
}: {
  roles: RoleWithPermissions[];
  managers: ManagerOption[];
  lockRoleToRep?: boolean;
  repRoleId?: string;
}) {
  const [state, formAction] = useActionState<UserActionState, FormData>(
    createUserAction,
    { success: false }
  );

  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<UserCreateInput>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      image: "",
      password: "",
      confirmPassword: "",
      roleRoleId: lockRoleToRep ? (repRoleId ?? "") : "",
      status: "ACTIVE",
      managerId: "",
      requirePasswordChange: false,
    },
  });

  const watchedName = form.watch("name");
  const watchedRole = form.watch("roleRoleId");
  const watchedPassword = form.watch("password");
  const watchedConfirm = form.watch("confirmPassword");
  const selectedRole = roles.find((r) => r.id === watchedRole);
  const isManagerRole = selectedRole?.name === "Sales Manager";
  const strength = passwordStrength(watchedPassword);
  const passwordsMatch = watchedConfirm.length > 0 && watchedPassword === watchedConfirm;
  const passwordsMismatch = watchedConfirm.length > 0 && watchedPassword !== watchedConfirm;
  const canSubmit = watchedPassword === watchedConfirm;

  const initials = watchedName
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/document-asset", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setImageUrl(data.url);
      form.setValue("image", data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Basic Information */}
      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form action={formAction} className="space-y-6">
              <input type="hidden" name="image" value={imageUrl} />

              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                {imageUrl ? (
                  <div className="relative">
                    <img src={imageUrl} alt="Profile" className="h-20 w-20 rounded-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageUrl(""); form.setValue("image", ""); }}
                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#103447] text-xl font-bold text-white">
                    {initials}
                  </div>
                )}
                <div>
                  <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-input px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted/50">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading..." : "Upload Profile Picture"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                  <p className="mt-1 text-xs text-muted-foreground">Optional — initials avatar shown if no image</p>
                  {uploadError && <p className="mt-1 text-xs text-destructive">{uploadError}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl><Input placeholder="John Cruz" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl><Input placeholder="0917 123 4567" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl><Input type="email" placeholder="john@company.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Section 2: Account Information */}
              <div className="border-t pt-6">
                <h3 className="mb-4 text-sm font-semibold text-[#103447]">Account Information</h3>
                {lockRoleToRep ? (
                  <>
                    <input type="hidden" name="roleRoleId" value={repRoleId ?? ""} />
                    <input type="hidden" name="status" value="ACTIVE" />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="mb-1 text-sm font-medium">Role</p>
                        <p className="text-sm text-muted-foreground">Sales Representative</p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-medium">Status</p>
                        <p className="text-sm text-muted-foreground">Active</p>
                      </div>
                    </div>
                  </>
                ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="roleRoleId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select name={field.name} items={buildOptionItems(roles.map(r => ({ value: r.id, label: r.name })))} value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      {selectedRole && ROLE_DESCRIPTIONS[selectedRole.name] && (
                        <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[selectedRole.name]}</p>
                      )}
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select name={field.name} items={{ "ACTIVE": "Active", "INACTIVE": "Inactive" }} value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                )}

                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporary Password *</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input type={showPassword ? "text" : "password"} placeholder="At least 8 characters" {...field} />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {strength.score > 0 && (
                        <div className="space-y-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                              <div
                                key={n}
                                className={cn(
                                  "h-1 flex-1 rounded-full transition-colors",
                                  n <= strength.score ? strength.color : "bg-gray-200"
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">{strength.label}</p>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password *</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Re-enter password"
                            className={cn(
                              passwordsMismatch && "border-red-500",
                              passwordsMatch && "border-green-500",
                            )}
                            aria-invalid={passwordsMismatch}
                            aria-describedby="confirm-password-feedback"
                            {...field}
                          />
                        </FormControl>
                        {passwordsMatch && (
                          <Check className="absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                        )}
                        {passwordsMismatch && (
                          <X className="absolute right-8 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                        )}
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordsMatch && (
                        <p id="confirm-password-feedback" role="status" className="flex items-center gap-1 text-xs text-green-600">
                          <Check className="h-3 w-3" /> Passwords match
                        </p>
                      )}
                      {passwordsMismatch && (
                        <p id="confirm-password-feedback" role="alert" className="flex items-center gap-1 text-xs text-red-500">
                          <X className="h-3 w-3" /> Passwords do not match.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <Label className="mt-4 flex items-center gap-2 text-sm font-normal">
                  <Checkbox name="requirePasswordChange" />
                  Require password change on first login
                </Label>
              </div>

              {/* Section 3: Work Information */}
              <div className="border-t pt-6">
                <h3 className="mb-4 text-sm font-semibold text-[#103447]">Work Information</h3>
                <FormField control={form.control} name="managerId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direct Manager</FormLabel>
                    <Select
                      name={field.name}
                      items={managers.length > 0 ? buildOptionItems(managers.map(m => ({ value: m.id, label: m.name }))) : {}}
                      value={isManagerRole ? null : (field.value || null)}
                      onValueChange={field.onChange}
                      disabled={isManagerRole || managers.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={isManagerRole ? "N/A — Sales Manager has no direct manager" : "Select a manager"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {managers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {state.error && (
                <p className="text-sm text-destructive">{state.error}</p>
              )}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  title={!canSubmit ? "Passwords must match before creating the user." : undefined}
                >
                  Create User
                </Button>
                <Button type="button" variant="outline" onClick={() => history.back()}>Cancel</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
