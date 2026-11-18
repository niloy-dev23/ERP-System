import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  info: {
    icon: Info,
    className:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200",
    iconClass: "text-sky-500",
  },
  success: {
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200",
    iconClass: "text-emerald-500",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200",
    iconClass: "text-amber-500",
  },
  error: {
    icon: XCircle,
    className:
      "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200",
    iconClass: "text-rose-500",
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  action,
  className,
}: {
  variant?: keyof typeof VARIANTS;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const meta = VARIANTS[variant];
  const Icon = meta.icon;
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-xs leading-relaxed",
        meta.className,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 size-4 shrink-0", meta.iconClass)} aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={cn(title && "mt-0.5 opacity-90")}>{children}</div> : null}
        {action ? <div className="mt-2">{action}</div> : null}
      </div>
    </div>
  );
}
