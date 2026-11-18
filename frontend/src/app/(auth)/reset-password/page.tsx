import type { Metadata } from "next";
import { Suspense } from "react";
import { FormSkeleton } from "@/components/auth/form-skeleton";
import { ResetFlow } from "@/components/auth/reset-flow";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Choose a new password for your TaskFlow account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <ResetFlow />
    </Suspense>
  );
}
