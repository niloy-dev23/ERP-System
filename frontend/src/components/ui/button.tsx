import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg" | "icon";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-accent text-white shadow-sm shadow-teal-900/10 hover:bg-accent-strong dark:text-slate-950",
  secondary:
    "bg-ink text-surface shadow-sm hover:opacity-90",
  outline:
    "border border-line bg-surface text-ink hover:border-line-strong hover:bg-surface-2",
  ghost: "text-ink-soft hover:bg-surface-2 hover:text-ink",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
  subtle: "bg-accent-soft text-accent-ink hover:brightness-95",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 gap-1.5 rounded-lg px-3 text-[13px]",
  md: "h-[42px] gap-2 rounded-xl px-4 text-sm",
  lg: "h-12 gap-2 rounded-xl px-5 text-sm",
  icon: "size-9 rounded-lg",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leadingIcon,
  trailingIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-55",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        leadingIcon
      )}
      {children}
      {!loading && trailingIcon}
    </button>
  );
}
