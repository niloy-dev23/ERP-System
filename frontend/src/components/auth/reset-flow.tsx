"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-form";

export function ResetFlow() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Set a fresh password for your account. Existing sessions will be signed out."
      footer={
        <span>
          Need a new link?{" "}
          <Link
            href="/forgot-password"
            className="font-semibold text-accent hover:text-accent-strong"
          >
            Request another
          </Link>
        </span>
      }
    >
      <ResetPasswordForm initialToken={token} />
    </AuthShell>
  );
}
