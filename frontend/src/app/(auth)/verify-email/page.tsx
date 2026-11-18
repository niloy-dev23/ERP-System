import type { Metadata } from "next";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/auth/form-skeleton";
import { VerifyEmailView } from "@/components/auth/verify-view";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Confirm your email address to activate your TaskFlow account.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <VerifyEmailView />
    </Suspense>
  );
}
