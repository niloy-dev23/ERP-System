import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-sky-700 text-white shadow-md shadow-teal-900/20",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-5">
        <path
          d="M5 7.5h8M5 12h5M5 16.5h3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="m14 15.5 2.4 2.4L21 13.4"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Brand({
  href = "/",
  compact = false,
  className,
  subtitle = "Task workspace",
}: {
  href?: string;
  compact?: boolean;
  className?: string;
  subtitle?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="TaskFlow home"
    >
      <BrandMark className="transition-transform duration-200 group-hover:-rotate-3" />
      {!compact ? (
        <span className="leading-tight">
          <span className="flex items-baseline gap-1 text-[17px] font-semibold tracking-tight text-ink">
            TaskFlow
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
            {subtitle}
          </span>
        </span>
      ) : null}
    </Link>
  );
}
