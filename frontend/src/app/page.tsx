"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme";
import { useApiHealth } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Authentication that holds up",
    body: "JWT access tokens, rotating refresh tokens, verified email sign-up, and password recovery wired directly to the Express API.",
    tag: "Auth",
  },
  {
    icon: ListChecks,
    title: "A task workflow, not a list",
    body: "Move work through To do, In progress, Archived, and Completed with deadline intelligence and overdue alerts.",
    tag: "Tasks",
  },
  {
    icon: Users,
    title: "Team directory with roles",
    body: "Search the workspace, inspect member profiles, and let admins approve or pause accounts in a single click.",
    tag: "People",
  },
  {
    icon: RefreshCw,
    title: "Silent token refresh",
    body: "Sessions stay alive without interrupting work. Expired access tokens are rotated in the background on the next request.",
    tag: "Session",
  },
  {
    icon: Mail,
    title: "Email-aware flows",
    body: "Verification and reset links are handled gracefully, with resend controls and clear next steps for every state.",
    tag: "Flows",
  },
  {
    icon: Code2,
    title: "Transparent API surface",
    body: "Every request maps to a documented backend endpoint. Jump from the UI to Swagger UI whenever you need the raw contract.",
    tag: "API",
  },
];

const ENDPOINTS = [
  "POST /login",
  "POST /registration",
  "GET /me",
  "GET /getAllTask",
  "POST /createTask",
  "GET /getAll",
  "PATCH /update/:id",
  "POST /refresh",
];

export default function LandingPage() {
  const { user, ready } = useAuth();
  const apiStatus = useApiHealth();
  const docsUrl =
    process.env.NEXT_PUBLIC_API_DOCS_URL ?? "http://localhost:8000/api-docs";

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] hero-glow" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] grid-backdrop opacity-60" />

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Brand />
        <nav className="hidden items-center gap-7 text-[13px] font-medium text-ink-soft md:flex">
          <a href="#features" className="transition hover:text-ink">
            Features
          </a>
          <a href="#workflow" className="transition hover:text-ink">
            Workflow
          </a>
          <a href="#api" className="transition hover:text-ink">
            API
          </a>
          <Link href="/developers" className="transition hover:text-ink">
            Explorer
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          {ready && user ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-[13px] font-semibold text-surface transition hover:opacity-90"
            >
              Dashboard <ArrowRight className="size-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden h-9 items-center rounded-lg px-3 text-[13px] font-semibold text-ink-soft transition hover:bg-surface hover:text-ink sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-[13px] font-semibold text-surface transition hover:opacity-90"
              >
                Get started <ArrowRight className="size-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:pb-28 lg:pt-20">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-[11px] font-semibold text-ink-soft shadow-xs backdrop-blur">
              <Sparkles className="size-3.5 text-accent" />
              Next.js frontend · Express API
              <span className="mx-0.5 h-3 w-px bg-line" />
              <span
                className={`inline-flex items-center gap-1.5 ${
                  apiStatus === "online"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : apiStatus === "offline"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-amber-600 dark:text-amber-400"
                }`}
              >
                <span className="relative flex size-1.5">
                  {apiStatus === "online" ? (
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  ) : null}
                  <span
                    className={`relative inline-flex size-1.5 rounded-full ${
                      apiStatus === "online"
                        ? "bg-emerald-500"
                        : apiStatus === "offline"
                          ? "bg-rose-500"
                          : "bg-amber-500"
                    }`}
                  />
                </span>
                {apiStatus === "online"
                  ? "API online"
                  : apiStatus === "offline"
                    ? "API offline"
                    : "Connecting"}
              </span>
            </span>

            <h1 className="mt-6 max-w-xl text-[2.65rem] font-semibold leading-[1.06] tracking-tight text-ink sm:text-6xl">
              One calm place for
              <span className="relative mx-2 inline-block">
                <span className="relative z-10 text-accent">your team&apos;s</span>
                <span className="absolute inset-x-0 bottom-1 z-0 h-2.5 rounded-full bg-accent/15" />
              </span>
              work.
            </h1>

            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
              A production-grade interface for the TaskFlow backend. Secure
              sign-in, role-aware task management, and a team directory that
              feels finished out of the box.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={ready && user ? "/dashboard" : "/register"}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-white shadow-lg shadow-teal-900/15 transition hover:bg-accent-strong dark:text-slate-950"
              >
                {ready && user ? "Open your workspace" : "Create your account"}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href={ready && user ? "/tasks" : "/login"}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-6 text-sm font-semibold text-ink transition hover:border-line-strong hover:bg-surface-2"
              >
                {ready && user ? "View tasks" : "Sign in"}
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-6">
              {[
                ["21", "API endpoints"],
                ["4", "Task stages"],
                ["3", "Access roles"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="text-xl font-semibold tracking-tight text-ink">
                    {value}
                  </dt>
                  <dd className="text-[11px] font-medium uppercase tracking-wide text-muted">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative animate-rise [animation-delay:120ms]">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-teal-500/12 via-sky-500/8 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-line bg-surface/95 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur">
              <div className="flex items-center gap-2 px-3 py-2.5">
                <span className="size-2.5 rounded-full bg-rose-400/80" />
                <span className="size-2.5 rounded-full bg-amber-400/80" />
                <span className="size-2.5 rounded-full bg-emerald-400/80" />
                <span className="mx-auto flex items-center gap-1.5 rounded-md bg-surface-2 px-3 py-1 text-[10px] font-medium text-muted ring-1 ring-line">
                  <LockKeyhole className="size-3" /> app.taskflow.local
                </span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-line bg-canvas">
                <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-sky-700 text-[10px] font-bold text-white">
                      TF
                    </span>
                    <div className="leading-tight">
                      <p className="text-[11px] font-semibold text-ink">
                        Sprint board
                      </p>
                      <p className="text-[9px] text-muted">6 open tasks</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-accent-soft px-2 py-1 text-[9px] font-semibold text-accent-ink">
                    + New task
                  </span>
                </div>

                <div className="grid gap-2.5 p-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-muted">
                        <span className="size-1.5 rounded-full bg-slate-400" />
                        To do
                      </span>
                      <span className="text-[9px] text-muted">2</span>
                    </div>
                    {[
                      ["Polish onboarding flow", "Tomorrow"],
                      ["Draft Q4 roadmap", "Fri, Nov 21"],
                    ].map(([title, meta]) => (
                      <div
                        key={title}
                        className="rounded-lg border border-line bg-surface p-2.5 shadow-xs"
                      >
                        <p className="text-[10px] font-semibold leading-snug text-ink">
                          {title}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[8px] font-medium text-slate-600 dark:bg-slate-500/15 dark:text-slate-300">
                            {meta}
                          </span>
                          <span className="size-4 rounded-full bg-gradient-to-br from-teal-400 to-sky-500" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-wide text-muted">
                        <span className="size-1.5 rounded-full bg-amber-500" />
                        In progress
                      </span>
                      <span className="text-[9px] text-muted">2</span>
                    </div>
                    <div className="rounded-lg border border-line bg-surface p-2.5 shadow-xs">
                      <p className="text-[10px] font-semibold leading-snug text-ink">
                        Ship role permissions
                      </p>
                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2">
                        <div className="h-full w-2/3 rounded-full bg-amber-500" />
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[8px] font-medium text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                          Due today
                        </span>
                        <span className="text-[8px] text-muted">2 owners</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/50 p-2.5 dark:border-emerald-400/20 dark:bg-emerald-400/5">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3 text-emerald-500" />
                        <p className="text-[10px] font-semibold text-ink line-through decoration-emerald-400/60">
                          Review auth emails
                        </p>
                      </div>
                      <p className="mt-1 pl-4.5 text-[8px] text-muted">
                        Completed just now
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-4 hidden w-56 rounded-2xl border border-line bg-surface/95 p-3.5 shadow-xl backdrop-blur sm:block">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <p className="text-[11px] font-semibold text-ink">
                    Secure session
                  </p>
                  <p className="text-[9px] text-muted">
                    Refresh token rotated
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="border-y border-line bg-surface/50 py-20 backdrop-blur"
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                Built around the API
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Every backend capability, considered.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                No dead ends, no placeholder screens. Each view maps to a real
                endpoint and handles loading, empty, error, and permission
                states.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="surface-card group p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
                      <feature.icon className="size-[18px]" />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted/80">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="py-20">
          <div className="mx-auto grid w-full max-w-7xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                The workflow
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                From first sign-up to shipped work.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                The frontend mirrors the backend&apos;s real lifecycle, including
                email verification and admin approval, so the experience is
                honest about what the API expects.
              </p>
              <div className="mt-8 space-y-5">
                {[
                  {
                    step: "01",
                    title: "Register and verify",
                    body: "Create an account with your profile details, then confirm the email address generated by the API.",
                  },
                  {
                    step: "02",
                    title: "Sign in securely",
                    body: "Access tokens are attached to every request and refreshed automatically when they expire.",
                  },
                  {
                    step: "03",
                    title: "Plan and progress",
                    body: "Move tasks across four stages, track deadlines, and surface overdue work at a glance.",
                  },
                  {
                    step: "04",
                    title: "Administer the team",
                    body: "Admins create and edit tasks, and approve or pause member accounts from the directory.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface font-mono text-[11px] font-semibold text-accent">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-ink">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-card overflow-hidden lg:mt-16">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                    <LayoutDashboard className="size-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-ink">
                      Workspace snapshot
                    </p>
                    <p className="text-[10px] text-muted">Live API data</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20">
                  Synced
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-5">
                {[
                  ["Active tasks", "12", "list icon"],
                  ["Completed", "34", "check icon"],
                  ["Teammates", "8", "people icon"],
                  ["Pending approval", "2", "shield icon"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-line bg-surface-2/60 p-3.5"
                  >
                    <p className="text-[10px] font-medium text-muted">{label}</p>
                    <p className="mt-1 text-xl font-semibold tracking-tight text-ink">
                      {value}
                    </p>
                  </div>
                ))}
                <div className="col-span-2 rounded-xl border border-line bg-surface-2/60 p-3.5">
                  <div className="flex items-center justify-between text-[10px] font-medium text-muted">
                    <span>Completion rate</span>
                    <span className="text-ink">74%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
                    <div className="h-full w-[74%] rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" />
                  </div>
                  <p className="mt-2 text-[9px] text-muted">
                    34 of 46 tasks completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="api"
          className="border-y border-line bg-surface/50 py-20 backdrop-blur"
        >
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                Transparent by design
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                A frontend that respects the contract.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                Requests flow through a same-origin proxy, so the Express app
                needs no CORS changes. Tokens, error messages, and validation
                rules come straight from the backend.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "No backend code modified",
                  "Same-origin /api/backend proxy",
                  "Automatic 401 refresh and retry",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs font-medium text-ink-soft"
                  >
                    <CheckCircle2 className="size-4 text-accent" />
                    {item}
                  </div>
                ))}
              </div>
              <a
                href={docsUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-7 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent transition hover:text-accent-strong"
              >
                Open Swagger UI <ArrowRight className="size-3.5" />
              </a>
            </div>

            <div className="overflow-hidden rounded-2xl border border-line bg-[#0b1220] shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400">
                  <span className="size-2 rounded-full bg-rose-400/70" />
                  <span className="size-2 rounded-full bg-amber-400/70" />
                  <span className="size-2 rounded-full bg-emerald-400/70" />
                  <span className="ml-2">api client</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  /api/v1
                </span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[11px] leading-6 text-slate-300">
                <code>{`// proxied through Next.js
const res = await fetch("/api/backend/getAllTask", {
  headers: { Authorization: \`Bearer \${token}\` },
});

// 401 -> refresh -> retry once
const { data } = await res.json(); // Task[]`}</code>
              </pre>
              <div className="flex flex-wrap gap-1.5 border-t border-white/10 p-4">
                {ENDPOINTS.map((endpoint) => (
                  <span
                    key={endpoint}
                    className="rounded-md bg-white/5 px-2 py-1 font-mono text-[9px] text-slate-400 ring-1 ring-inset ring-white/10"
                  >
                    {endpoint}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 px-6 py-14 text-center shadow-2xl sm:px-12">
            <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(40rem_20rem_at_50%_0%,rgba(45,212,191,0.35),transparent_70%)]" />
            <div className="relative mx-auto max-w-xl">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Ready to see your tasks in motion?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Sign in to the workspace, or create an account and verify your
                email to get started.
              </p>
              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href={ready && user ? "/dashboard" : "/login"}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  {ready && user ? "Open dashboard" : "Sign in"}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-[11px] text-muted sm:flex-row sm:px-6 lg:px-8">
          <Brand subtitle="Task workspace" />
          <p>Built with Next.js for the TaskFlow Express API.</p>
          <a
            href={docsUrl}
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-ink"
          >
            API documentation
          </a>
        </div>
      </footer>
    </div>
  );
}
