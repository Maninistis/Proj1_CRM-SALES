"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/features/user/schemas/login-schema";
import { loginAction, quickLoginAction, type AuthActionState } from "@/features/user/actions/auth-actions";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormValidationSummary } from "@/components/ui/form-validation-summary";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Users, User } from "lucide-react";

const isDev = process.env.NODE_ENV === "development";

const QUICK_ROLES = [
  { role: "admin", label: "Administrator", email: "admin@crm.local", icon: Shield },
  { role: "manager", label: "Sales Manager", email: "manager@crm.local", icon: Users },
  { role: "employee", label: "Sales Representative", email: "employee@crm.local", icon: User },
];

export function LoginForm() {
  const [state, formAction] = useActionState<AuthActionState, FormData>(
    loginAction,
    { success: false }
  );

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold text-[#103447]">Welcome Back</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to your CRM workspace.</p>
      </div>

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
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl><Input type="password" placeholder="********" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <FormValidationSummary />
          <Button type="submit" className="w-full bg-[#DF853A] hover:bg-[#C76E26]">Sign In</Button>
        </form>
      </Form>

      {isDev && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">Quick Demo Login</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-2">
            {QUICK_ROLES.map(({ role, label, email, icon: Icon }) => (
              <form key={role} action={quickLoginAction}>
                <input type="hidden" name="role" value={role} />
                <Button type="submit" variant="outline" className="w-full justify-start gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-[#103447]" />
                  <span className="flex-1 text-left">
                    <span className="block text-sm font-medium">{label}</span>
                    <span className="block text-xs text-muted-foreground">{email}</span>
                  </span>
                </Button>
              </form>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
