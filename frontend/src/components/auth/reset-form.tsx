"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, KeyRound, LockKeyhole } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, PasswordInput, TextInput } from "@/components/ui/form";
import { api } from "@/lib/api";
import { cn, getErrorMessage, passwordScore } from "@/lib/utils";

export function ResetPasswordForm({ initialToken = "" }: { initialToken?: string }) {
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const score = passwordScore(password);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldError(null);

    if (!token.trim()) {
      setFieldError("Paste the reset token from your email link.");
      return;
    }
    if (password.length < 8) {
      setFieldError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFieldError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await api.resetPassword({
        token: token.trim(),
        password,
        confirmPassword,
      });
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err, "Could not reset your password"));
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="space-y-5 text-center">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20">
          <CheckCircle2 className="size-7" />
        </span>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-ink">Password updated</p>
          <p className="text-xs leading-relaxed text-muted">
            Your password has been changed and existing sessions were revoked.
            Sign in with your new password.
          </p>
        </div>
        <Link
          href="/login"
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-white transition hover:bg-accent-strong dark:text-slate-950"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error ? (
        <Alert variant="error" title="Reset failed">
          {error}
        </Alert>
      ) : null}

      {fieldError ? (
        <Alert variant="warning" title="Check the form">
          {fieldError}
        </Alert>
      ) : null}

      {!initialToken ? (
        <Field
          label="Reset token"
          htmlFor="token"
          required
          hint="Find this in the reset link, after token=."
        >
          <TextInput
            id="token"
            name="token"
            placeholder="Paste your reset token"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            leadingIcon={<KeyRound className="size-4" />}
            disabled={submitting}
            className="font-mono text-xs"
          />
        </Field>
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-xs text-muted">
          <KeyRound className="size-3.5 text-accent" />
          Reset token detected from your link
        </div>
      )}

      <Field label="New password" htmlFor="password" required hint="At least 8 characters.">
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="Choose a new password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={submitting}
        />
      </Field>

      {password ? (
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-line">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                score <= 1 ? "w-1/4 bg-rose-500" : score === 2 ? "w-2/4 bg-amber-500" : score === 3 ? "w-3/4 bg-sky-500" : "w-full bg-emerald-500",
              )}
            />
          </div>
          <span className="text-[10px] font-semibold text-muted">
            {score <= 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Good" : "Strong"}
          </span>
        </div>
      ) : null}

      <Field label="Confirm new password" htmlFor="confirmPassword" required>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Repeat the new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={submitting}
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        loading={submitting}
        leadingIcon={<LockKeyhole className="size-4" />}
      >
        Reset password
      </Button>

      <p className="text-center text-[11px] text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-accent hover:text-accent-strong">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
