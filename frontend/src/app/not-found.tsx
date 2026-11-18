import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 hero-glow" />
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Brand />
      </header>
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-line bg-surface text-accent shadow-sm">
            <Compass className="size-7" />
          </span>
          <p className="mt-5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            404 · page not found
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            This page has moved off the board.
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The link may be outdated or the page may have been renamed. Head back
            to the workspace and pick up where you left off.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-ink px-4 text-sm font-semibold text-surface transition hover:opacity-90"
            >
              <ArrowLeft className="size-4" /> Back home
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:bg-surface-2"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
