import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormSkeleton } from "@/components/auth/form-skeleton";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your TaskFlow workspace.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see your tasks, team, and what needs attention."
      footer={
        <span>
          New to TaskFlow?{" "}
          <Link href="/register" className="font-semibold text-accent hover:text-accent-strong">
            Create an account
          </Link>
        </span>
      }
    >
      <Suspense fallback={<FormSkeleton />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
