import type { Metadata } from "next";
import { RegisterFlow } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a TaskFlow account and verify your email to get started.",
};

export default function RegisterPage() {
  return <RegisterFlow />;
}
