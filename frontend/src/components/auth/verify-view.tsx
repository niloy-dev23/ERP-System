"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  MailCheck,
  MailWarning,
  Send,
} from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, TextInput } from "@/components/ui/form";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { SafeUser } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";

type Status = "idle" | "verifying" | "success" | "error";

export function VerifyEmailView() {
  const params = useSearchParams();
  const toast = useToast();
  const initialToken = params.get("token") ?? "";
  const initialEmail = params.get("email") ?? "";

  const [status, setStatus] = useState<Status>(initialToken ? "verifying" : "idle");
  const [message, setMessage] = useState<string | null>(null);
  const [verifiedUser, setVerifiedUser] = useState<SafeUser | null>(null);
  const [token, setToken] = useState(initialToken);
  const [email, setEmail] = useState(initialEmail);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const attempted = useRef<string | null>(null);

  const verify = async (value: string) => {
    if (!value.trim()) {
      setStatus("error");
      setMessage("Enter the verification token from your email.");
      return;
    }
    setStatus("verifying");
    setMessage(null);
    try {
      const user = await api.verifyEmail(value.trim());
      setVerifiedUser(user);
      setStatus("success");
      toast.success("Email verified", "You can now sign in to TaskFlow.");
    } catch (err) {
      setStatus("error");
      setMessage(getErrorMessage(err, "Verification failed"));
    }
  };

  useEffect(() => {
    if (!initialToken) return;
    if (attempted.current === initialToken) return;
    attempted.current = initialToken;
    verify(initialToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  const resend = async () => {
    if (!email.trim()) return;
    setResending(true);
    try {
      await api.resendVerification(email.trim());
      setResent(true);
      toast.success("Verification email sent", "Check your inbox and spam folder.");
    } catch (err) {
      toast.error("Could not resend email", getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  const titles: Record<Status, { title: string; subtitle: string }> = {
    idle: {
      title: "Verify your email",
      subtitle:
        "Open the verification link from your inbox, or paste the token below.",
    },
    verifying: {
      title: "Verifying your email",
      subtitle: "Hold on while we confirm your token with the API.",
    },
    success: {
      title: "Email verified",
      subtitle: "Your account is active. You can sign in right away.",
    },
    error: {
      title: "Verification issue",
      subtitle: "The token could not be confirmed. Request a new link below.",
    },
  };

  return (
    <AuthShell
      title={titles[status].title}
      subtitle={titles[status].subtitle}
      footer={
        <span>
          Back to{" "}
          <Link href="/login" className="font-semibold text-accent hover:text-accent-strong">
            sign in
          </Link>
        </span>
      }
    >
      <div className="space-y-5">
        {status === "verifying" ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface-2/60 px-5 py-8">
            <span className="size-8 animate-spin rounded-full border-[3px] border-line border-t-accent" />
            <p className="text-xs font-medium text-muted">Checking your token...</p>
          </div>
        ) : null}

        {status === "success" ? (
          <>
            <div className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-7 text-center dark:border-emerald-400/20 dark:bg-emerald-400/5">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                <CheckCircle2 className="size-7" />
              </span>
              <p className="mt-4 text-sm font-semibold text-ink">
                {verifiedUser?.username ?? "Your account"} is verified
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                {verifiedUser?.email ?? "Your email address"} can now access the
                workspace.
              </p>
            </div>
            <Link
              href={`/login${verifiedUser?.email ? `?email=${encodeURIComponent(verifiedUser.email)}` : ""}`}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white transition hover:bg-accent-strong dark:text-slate-950"
            >
              Continue to sign in <ArrowRight className="size-4" />
            </Link>
          </>
        ) : null}

        {status === "error" ? (
          <Alert variant="error" title="Could not verify">
            {message}
          </Alert>
        ) : null}

        {status !== "success" && status !== "verifying" ? (
          <>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                verify(token);
              }}
              className="space-y-3"
            >
              <Field
                label="Verification token"
                htmlFor="token"
                hint="Found after token= in your verification link."
              >
                <TextInput
                  id="token"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Paste your verification token"
                  leadingIcon={<KeyRound className="size-4" />}
                  className="font-mono text-xs"
                />
              </Field>
              <Button type="submit" className="w-full" leadingIcon={<MailCheck className="size-4" />}>
                Verify email
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                or resend the link
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                resend();
              }}
              className="space-y-3"
            >
              <Field label="Email address" htmlFor="verify-email">
                <TextInput
                  id="verify-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  leadingIcon={<MailWarning className="size-4" />}
                />
              </Field>
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                loading={resending}
                disabled={resent || !email.trim()}
                leadingIcon={!resending ? <Send className="size-4" /> : undefined}
              >
                {resent ? "Verification email sent" : "Resend verification email"}
              </Button>
            </form>
          </>
        ) : null}
      </div>
    </AuthShell>
  );
}
