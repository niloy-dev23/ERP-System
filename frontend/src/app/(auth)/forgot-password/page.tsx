import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Request a password reset link for your TaskFlow account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we will request a secure, single-use link from the API."
      footer={
        <span>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-accent hover:text-accent-strong">
            Back to sign in
          </Link>
        </span>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
