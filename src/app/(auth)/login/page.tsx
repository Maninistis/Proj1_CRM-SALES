import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F1EBE3] px-4">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
