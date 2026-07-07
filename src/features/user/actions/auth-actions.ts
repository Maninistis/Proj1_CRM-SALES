"use server";

import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth/auth";
import { register as registerUser } from "@/features/user/services/auth.service";
import { loginSchema } from "@/features/user/schemas/login-schema";
import { registerSchema } from "@/features/user/schemas/register-schema";
import { AppError } from "@/lib/errors";

export type AuthActionState = {
  success: boolean;
  error?: string;
};

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    return {
      success: false,
      error: "Invalid email or password",
    };
  }

  redirect("/dashboard");
}

export async function registerAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const parsed = registerSchema.safeParse({ name, email, password });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  try {
    await registerUser(parsed.data);
  } catch (e) {
    if (e instanceof AppError) {
      return { success: false, error: e.message };
    }
    return { success: false, error: "Registration failed" };
  }

  // Auto-login after registration
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    // Registration succeeded but auto-login failed — redirect to login
    redirect("/login");
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/login");
}
