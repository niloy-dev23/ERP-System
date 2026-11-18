"use client";

import { useState } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const CONTROL_BASE =
  "w-full rounded-xl border border-line bg-surface text-sm text-ink shadow-xs transition placeholder:text-muted/70 hover:border-line-strong focus:border-accent focus:outline-none focus:ring-[3px] focus:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-60";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
  action,
}: {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor={htmlFor}
            className="text-[13px] font-medium text-ink-soft"
          >
            {label}
            {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
          </label>
          {action}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({
  className,
  leadingIcon,
  trailing,
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
  invalid?: boolean;
}) {
  return (
    <div className="relative">
      {leadingIcon ? (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
          {leadingIcon}
        </span>
      ) : null}
      <input
        {...props}
        aria-invalid={invalid || undefined}
        className={cn(
          CONTROL_BASE,
          "h-11 px-3.5",
          Boolean(leadingIcon) && "pl-10",
          Boolean(trailing) && "pr-11",
          invalid && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
          className,
        )}
      />
      {trailing ? (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</span>
      ) : null}
    </div>
  );
}

export function PasswordInput({
  className,
  invalid,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <TextInput
      {...props}
      type={visible ? "text" : "password"}
      invalid={invalid}
      className={className}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="rounded-md p-2 text-muted transition hover:bg-surface-2 hover:text-ink"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  );
}

export function TextArea({
  className,
  invalid,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...props}
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL_BASE,
        "min-h-24 resize-y px-3.5 py-3 leading-relaxed",
        invalid && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
        className,
      )}
    />
  );
}

export function Select({
  className,
  children,
  invalid,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        {...props}
        aria-invalid={invalid || undefined}
        className={cn(
          CONTROL_BASE,
          "h-11 cursor-pointer appearance-none pl-3.5 pr-10",
          invalid && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/20",
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
    </div>
  );
}
