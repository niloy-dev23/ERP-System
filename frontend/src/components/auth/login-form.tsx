"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, PasswordInput, TextInput } from "@/components/ui/form";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { getErrorMessage } from "@/lib/utils";

export function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();

  const nextParam = params.get("next");
  const next = nextParam && nextParam.startsWith("/") ? nextParam : "/dashboard";

  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNeedsVerification(false);

    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      toast.success("Welcome back", "You are signed in to your workspace.");
      router.replace(next);
    } catch (err) {
      const message = getErrorMessage(err, "Could not sign in");
      setError(message);
      if (err instanceof ApiError && err.status === 403) {
        setNeedsVerification(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (!email.trim()) {
      setError("Enter your email address first so we can resend the link.");
      return;
    }
    setResending(true);
    try {
      await api.resendVerification(email.trim());
      toast.success(
        "Verification email sent",
        "Check your inbox for a fresh verification link.",
      );
      setResendCooldown(true);
      window.setTimeout(() => setResendCooldown(false), 30_000);
    } catch (err) {
      toast.error("Could not resend email", getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error ? (
        <Alert
          variant="error"
          title="Sign in failed"
          action={
            needsVerification ? (
              <button
                type="button"
                onClick={resend}
                disabled={resending || resendCooldown}
                className="font-semibold underline underline-offset-2 disabled:opacity-60"
              >
                {resending
                  ? "Sending..."
                  : resendCooldown
                    ? "Sent - check your inbox"
                    : "Resend verification email"}
              </button>
            ) : undefined
          }
        >
          {error}
        </Alert>
      ) : null}

      <Field label="Email address" htmlFor="email" required>
        <TextInput
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          leadingIcon={<Mail className="size-4" />}
          disabled={submitting}
          required
        />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        required
        action={
          <Link
            href="/forgot-password"
            className="text-[11px] font-semibold text-accent transition hover:text-accent-strong"
          >
            Forgot password?
          </Link>
        }
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={submitting}
          required
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={submitting}
        trailingIcon={<ArrowRight className="size-4" />}
      >
        Sign in
      </Button>

      <p className="text-center text-[11px] leading-relaxed text-muted">
        Sign-in attempts are rate limited by the API to 3 tries every 15 minutes.
      </p>
    </form>
  );
}
