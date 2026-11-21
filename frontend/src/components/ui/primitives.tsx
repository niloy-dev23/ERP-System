import type { ReactNode } from "react";
import { cn, initials } from "@/lib/utils";

export function Badge({
  children,
  className,
  dot,
}: {
  children: ReactNode;
  className?: string;
  dot?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        className,
      )}
    >
      {dot ? <span className={cn("size-1.5 rounded-full", dot)} aria-hidden /> : null}
      {children}
    </span>
  );
}

const AVATAR_SIZES = {
  xxs: "size-5 text-[9px]",
  xs: "size-7 text-[10px]",
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-lg",
  xl: "size-20 text-2xl",
};

export function Avatar({
  name,
  src,
  size = "md",
  className,
  ring = false,
}: {
  name?: string;
  src?: string;
  size?: keyof typeof AVATAR_SIZES;
  className?: string;
  ring?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-500 to-sky-600 font-semibold uppercase tracking-wide text-white",
        AVATAR_SIZES[size],
        ring && "ring-2 ring-surface outline outline-1 outline-line",
        className,
      )}
    >
      <span aria-hidden>{initials(name)}</span>
      {src ? (
        // Remote profile pictures come from arbitrary hosts, so a plain <img>
        // avoids configuring every possible image domain.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name ? `${name} avatar` : "Avatar"}
          className="absolute inset-0 size-full object-cover"
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : null}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-2 border-line border-t-accent",
        className,
      )}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-lg", className)} aria-hidden />;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line px-6 py-14 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-muted ring-1 ring-line">
          {icon}
        </span>
      ) : null}
      <div className="max-w-sm space-y-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        {description ? (
          <p className="text-xs leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

export function Progress({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-line", className)}
    >
      <div
        className={cn("h-full rounded-full bg-accent transition-all duration-500", barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
        {children}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
  hint?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="surface-card group relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-ink">{value}</p>
        </div>
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset",
            accent ??
              "bg-accent-soft text-accent-ink ring-transparent",
          )}
        >
          {icon}
        </span>
      </div>
      {hint ? <div className="mt-3 text-xs text-muted">{hint}</div> : null}
    </div>
  );
}
