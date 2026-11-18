import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Brand, BrandMark } from "@/components/brand";
import { ThemeToggle } from "@/components/theme";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.02fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#071019] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(40rem_28rem_at_10%_0%,rgba(20,184,166,0.25),transparent_65%),radial-gradient(32rem_24rem_at_95%_100%,rgba(14,165,233,0.22),transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,#000_20%,transparent_100%)]" />

        <div className="relative flex items-center gap-2.5">
          <BrandMark />
          <span className="text-[17px] font-semibold tracking-tight text-white">
            TaskFlow
            <span className="ml-1 inline-block size-1.5 rounded-full bg-teal-400" />
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-300/90">
            Task & team workspace
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-white">
            Clarity for every task your team owns.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            A focused workspace built on top of a secure Express API. Plan work,
            track progress, and keep your team aligned.
          </p>

          <div className="mt-9 space-y-4">
            {[
              {
                icon: ShieldCheck,
                title: "Verified identity",
                body: "Email confirmation and rotating refresh tokens protect every session.",
              },
              {
                icon: Zap,
                title: "Instant context",
                body: "Deadlines, status, and team activity surfaced on one calm overview.",
              },
              {
                icon: CheckCircle2,
                title: "Role-aware controls",
                body: "Admins manage tasks and approvals while members stay focused.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-teal-300">
                  <item.icon className="size-4" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-white">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-400">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <span className="flex size-8 items-center justify-center rounded-lg bg-teal-500/15 font-mono text-[10px] font-semibold text-teal-300">
            API
          </span>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-white">
              Connected to the Express backend
            </p>
            <p className="text-[10px] text-slate-400">
              JWT auth · task endpoints · team directory
            </p>
          </div>
          <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.15)]" />
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col bg-canvas">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8">
          <Brand className="lg:invisible" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[12px] font-semibold text-ink-soft transition hover:text-ink"
            >
              <ArrowLeft className="size-3.5" /> Home
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-5 pb-10 pt-4 sm:px-8">
          <div
            className={`w-full animate-rise ${wide ? "max-w-[540px]" : "max-w-[420px]"}`}
          >
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-xl shadow-slate-900/[0.04] sm:p-8">
              <div className="mb-6 space-y-1.5">
                <h2 className="text-[22px] font-semibold tracking-tight text-ink">
                  {title}
                </h2>
                <p className="text-[13px] leading-relaxed text-muted">{subtitle}</p>
              </div>
              {children}
              {footer ? (
                <div className="mt-6 border-t border-line pt-5 text-center text-[13px] text-muted">
                  {footer}
                </div>
              ) : null}
            </div>
            <p className="mt-5 text-center text-[11px] leading-relaxed text-muted">
              By continuing you agree to keep your workspace secure.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
