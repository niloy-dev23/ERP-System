"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ImageIcon,
  Mail,
  MailCheck,
  MapPin,
  UserRound,
} from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, PasswordInput, Select, TextInput } from "@/components/ui/form";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { Gender } from "@/lib/types";
import { cn, getErrorMessage, passwordScore } from "@/lib/utils";

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const STRENGTH = [
  { label: "Too short", className: "bg-rose-500", width: "w-1/4" },
  { label: "Weak", className: "bg-rose-500", width: "w-1/4" },
  { label: "Fair", className: "bg-amber-500", width: "w-2/4" },
  { label: "Good", className: "bg-sky-500", width: "w-3/4" },
  { label: "Strong", className: "bg-emerald-500", width: "w-full" },
];

interface FormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: Gender | "";
  address: string;
  profilePic: string;
}

const EMPTY: FormState = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  gender: "",
  address: "",
  profilePic: "",
};

export function RegisterFlow() {
  const toast = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const set = (key: keyof FormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  };

  const score = passwordScore(form.password);
  const strength = STRENGTH[score];

  const validate = () => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (form.username.trim().length < 2) {
      next.username = "Use at least 2 characters for your name.";
    }
    if (!EMAIL_RE.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (form.password.length < 8) {
      next.password = "Password must be at least 8 characters.";
    }
    if (form.confirmPassword !== form.password) {
      next.confirmPassword = "Passwords do not match.";
    }
    if (!form.gender) {
      next.gender = "Select a gender option.";
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await api.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        gender: form.gender as Gender,
        address: form.address.trim() || undefined,
        profilePic: form.profilePic.trim() || undefined,
      });
      toast.success("Account created", "One more step: verify your email.");
      setRegisteredEmail(form.email.trim().toLowerCase());
      setNotice(response.message ?? null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setFieldErrors({ email: "An account already exists with this email." });
        setError(null);
      } else {
        setError(getErrorMessage(err, "Registration failed"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (!registeredEmail) return;
    setResending(true);
    try {
      await api.resendVerification(registeredEmail);
      setResent(true);
      toast.success("Verification email sent", "Check your inbox and spam folder.");
    } catch (err) {
      toast.error("Could not resend email", getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  if (registeredEmail) {
    return (
      <AuthShell
        title="Check your inbox"
        subtitle="Your account is ready. Verify your email address to sign in."
        footer={
          <span>
            Already verified?{" "}
            <Link
              href={`/login?email=${encodeURIComponent(registeredEmail)}`}
              className="font-semibold text-accent hover:text-accent-strong"
            >
              Sign in
            </Link>
          </span>
        }
      >
        <div className="space-y-5">
          <div className="flex flex-col items-center rounded-2xl border border-line bg-surface-2/60 px-5 py-7 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-ink">
              <MailCheck className="size-7" />
            </span>
            <p className="mt-4 text-sm font-semibold text-ink">
              Verification link sent
            </p>
            <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted">
              We sent an email to{" "}
              <span className="font-medium text-ink-soft">{registeredEmail}</span>.
              Open it and confirm your address to activate the account.
            </p>
          </div>

          {notice ? <Alert variant="info">{notice}</Alert> : null}

          <div className="space-y-2.5">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={resend}
              loading={resending}
              disabled={resent}
            >
              {resent ? "Verification email sent" : "Resend verification email"}
            </Button>
            <Link
              href="/verify-email"
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-semibold text-accent transition hover:text-accent-strong"
            >
              Enter a verification token manually <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <p className="text-[11px] leading-relaxed text-muted">
            The API builds verification links against the backend URL. If a link
            opens a JSON response, copy the token from its address bar and paste
            it on the verification page.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Set up your profile and start working with your team."
      wide
      footer={
        <span>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent hover:text-accent-strong">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error ? (
          <Alert variant="error" title="Registration failed">
            {error}
          </Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="username" required error={fieldErrors.username}>
            <TextInput
              id="username"
              name="username"
              autoComplete="name"
              placeholder="Ada Lovelace"
              value={form.username}
              onChange={set("username")}
              leadingIcon={<UserRound className="size-4" />}
              invalid={Boolean(fieldErrors.username)}
              disabled={submitting}
            />
          </Field>

          <Field label="Email address" htmlFor="email" required error={fieldErrors.email}>
            <TextInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={set("email")}
              leadingIcon={<Mail className="size-4" />}
              invalid={Boolean(fieldErrors.email)}
              disabled={submitting}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Password" htmlFor="password" required error={fieldErrors.password}>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={set("password")}
              invalid={Boolean(fieldErrors.password)}
              disabled={submitting}
            />
          </Field>

          <Field
            label="Confirm password"
            htmlFor="confirmPassword"
            required
            error={fieldErrors.confirmPassword}
          >
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              invalid={Boolean(fieldErrors.confirmPassword)}
              disabled={submitting}
            />
          </Field>
        </div>

        {form.password ? (
          <div className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-line">
              <div
                className={cn("h-full rounded-full transition-all", strength.className, strength.width)}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold",
                score <= 1 ? "text-rose-500" : score === 2 ? "text-amber-500" : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {strength.label}
            </span>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Gender" htmlFor="gender" required error={fieldErrors.gender}>
            <Select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={set("gender")}
              invalid={Boolean(fieldErrors.gender)}
              disabled={submitting}
            >
              <option value="">Select an option</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Other</option>
            </Select>
          </Field>

          <Field
            label="Address"
            htmlFor="address"
            hint="Optional"
            error={fieldErrors.address}
          >
            <TextInput
              id="address"
              name="address"
              autoComplete="street-address"
              placeholder="City, country"
              value={form.address}
              onChange={set("address")}
              leadingIcon={<MapPin className="size-4" />}
              disabled={submitting}
            />
          </Field>
        </div>

        <Field
          label="Profile picture URL"
          htmlFor="profilePic"
          hint="Optional — paste a public image URL (the API stores it as a string)."
          error={fieldErrors.profilePic}
        >
          <TextInput
            id="profilePic"
            name="profilePic"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={form.profilePic}
            onChange={set("profilePic")}
            leadingIcon={<ImageIcon className="size-4" />}
            disabled={submitting}
          />
        </Field>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={submitting}
          trailingIcon={<ArrowRight className="size-4" />}
        >
          Create account
        </Button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <CheckCircle2 className="size-3.5 text-accent" />
          Email verification is required before first sign-in.
        </div>
      </form>
    </AuthShell>
  );
}
