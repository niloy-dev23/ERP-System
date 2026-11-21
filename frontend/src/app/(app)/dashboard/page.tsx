"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  ListTodo,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PageHeader, StatCard, Badge, Avatar, EmptyState, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { TaskCard } from "@/components/tasks/task-views";
import { useAuth } from "@/lib/auth-context";
import { useTasks, useUsers } from "@/lib/hooks";
import {
  STATUS_META,
  TASK_STATUSES,
  cn,
  deadlineState,
  formatDate,
  getAssignee,
  isTaskOverdue,
  sortTasks,
} from "@/lib/utils";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function CompletionRing({ rate }: { rate: number }) {
  return (
    <div className="relative flex size-32 items-center justify-center">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(var(--accent) ${rate * 3.6}deg, var(--line) ${rate * 3.6}deg)`,
        }}
        aria-hidden
      />
      <div className="relative flex size-[104px] flex-col items-center justify-center rounded-full bg-surface">
        <span className="text-2xl font-semibold tracking-tight text-ink">{rate}%</span>
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
          complete
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { tasks, loading, error, refresh } = useTasks();
  const { users, loading: usersLoading } = useUsers();
  const [composeOpen, setComposeOpen] = useState(false);

  const stats = useMemo(() => {
    const active = tasks.filter((task) => task.status === "todo" || task.status === "pending");
    const done = tasks.filter((task) => task.status === "done");
    const overdue = tasks.filter(isTaskOverdue);
    const dueToday = tasks.filter(
      (task) => !isTaskOverdue(task) && deadlineState(task.deadline).state === "today",
    );
    const upcoming = sortTasks(tasks.filter((task) => task.status !== "done")).filter(
      (task) => {
        const state = deadlineState(task.deadline).state;
        return state !== "overdue" && state !== "none";
      },
    );
    const rate = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;
    const pendingMembers = users.filter((member) => !member.status);
    return { active, done, overdue, dueToday, upcoming, rate, pendingMembers };
  }, [tasks, users]);

  const recentTasks = useMemo(() => tasks.slice(0, 3), [tasks]);

  const firstName = user?.username?.split(/\s+/)[0] ?? "there";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={`${greeting()}, ${firstName}.`}
        description={`${today} — here is what needs your attention across the workspace.`}
        actions={
          <>
            <Link
              href="/tasks"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 text-[13px] font-semibold text-ink transition hover:bg-surface-2"
            >
              All tasks <ArrowRight className="size-3.5" />
            </Link>
            {isAdmin ? (
              <Button size="sm" onClick={() => setComposeOpen(true)} leadingIcon={<Plus className="size-4" />}>
                New task
              </Button>
            ) : null}
          </>
        }
      />

      {error ? (
        <Alert
          variant="error"
          title="Could not load the workspace"
          action={
            <button
              type="button"
              onClick={() => refresh()}
              className="font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          }
        >
          {error}
        </Alert>
      ) : null}

      {isAdmin && stats.pendingMembers.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-amber-400/20 dark:bg-amber-400/5">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-[13px] font-semibold text-amber-900 dark:text-amber-200">
                {stats.pendingMembers.length} member
                {stats.pendingMembers.length === 1 ? "" : "s"} awaiting approval
              </p>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-200/70">
                Review accounts and approve access from the team directory.
              </p>
            </div>
          </div>
          <Link
            href="/team?status=pending"
            className="inline-flex h-8 items-center gap-1.5 self-start rounded-lg bg-amber-600 px-3 text-[11px] font-semibold text-white transition hover:bg-amber-700 sm:self-auto"
          >
            Review team <ArrowRight className="size-3" />
          </Link>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[104px] rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Active tasks"
              value={stats.active.length}
              icon={<ListTodo className="size-5" />}
              hint={`${tasks.filter((task) => task.status === "todo").length} to do · ${tasks.filter((task) => task.status === "pending").length} in progress`}
            />
            <StatCard
              label="Completed"
              value={stats.done.length}
              icon={<CheckCircle2 className="size-5" />}
              hint={`${stats.rate}% completion rate`}
              accent="bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20"
            />
            <StatCard
              label="Overdue"
              value={stats.overdue.length}
              icon={<CircleAlert className="size-5" />}
              hint={
                stats.dueToday.length > 0
                  ? `${stats.dueToday.length} due today`
                  : "Nothing due today"
              }
              accent={
                stats.overdue.length > 0
                  ? "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-400/10 dark:text-rose-400 dark:ring-rose-400/20"
                  : undefined
              }
            />
            <StatCard
              label="Team members"
              value={usersLoading ? "—" : users.length}
              icon={<Users className="size-5" />}
              hint={isAdmin ? `${stats.pendingMembers.length} awaiting approval` : "Workspace directory"}
              accent="bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-400/10 dark:text-sky-400 dark:ring-sky-400/20"
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="surface-card lg:col-span-2">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                <CalendarClock className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-ink">Upcoming deadlines</h2>
                <p className="text-[11px] text-muted">Next five open tasks, soonest first</p>
              </div>
            </div>
            <Link
              href="/tasks"
              className="hidden items-center gap-1 text-[11px] font-semibold text-accent transition hover:text-accent-strong sm:inline-flex"
            >
              View board <ArrowRight className="size-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : stats.upcoming.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<CheckCircle2 className="size-5" />}
                title="No upcoming deadlines"
                description="Every open task is either unscheduled or already past due."
                className="border-0 py-10"
              />
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {stats.upcoming.slice(0, 5).map((task) => {
                const meta = STATUS_META[task.status];
                const deadline = new Date(task.deadline);
                const assignee = getAssignee(task);
                return (
                  <li key={task._id}>
                    <Link
                      href={`/tasks/${task._id}`}
                      className="group flex items-center gap-3.5 px-5 py-3.5 transition hover:bg-surface-2/60"
                    >
                      <div className="flex w-12 shrink-0 flex-col items-center rounded-lg border border-line bg-surface-2/70 py-1.5">
                        <span className="text-[9px] font-semibold uppercase tracking-wide text-muted">
                          {deadline.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-base font-semibold leading-none text-ink">
                          {deadline.toLocaleDateString("en-US", { day: "numeric" })}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold text-ink">
                          {task.title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <Badge className={meta.badge} dot={meta.dot}>
                            {meta.label}
                          </Badge>
                          <span className="text-[10px] text-muted">
                            {deadlineState(task.deadline).label}
                          </span>
                          {assignee ? (
                            <span className="inline-flex min-w-0 items-center gap-1 text-[10px] text-muted">
                              <Avatar name={assignee.username} size="xxs" />
                              <span className="max-w-[96px] truncate">
                                {assignee.username}
                              </span>
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <ArrowUpRight className="size-4 shrink-0 text-muted/50 transition group-hover:text-accent" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="surface-card flex flex-col">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">Workspace progress</h2>
            <p className="text-[11px] text-muted">All tasks across every stage</p>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-6">
            <CompletionRing rate={stats.rate} />
            <div className="grid w-full grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-line bg-surface-2/60 px-3 py-2.5">
                <p className="text-[10px] font-medium text-muted">Completed</p>
                <p className="mt-0.5 text-lg font-semibold text-ink">{stats.done.length}</p>
              </div>
              <div className="rounded-xl border border-line bg-surface-2/60 px-3 py-2.5">
                <p className="text-[10px] font-medium text-muted">Total tasks</p>
                <p className="mt-0.5 text-lg font-semibold text-ink">{tasks.length}</p>
              </div>
            </div>
            <div className="w-full space-y-2.5">
              {TASK_STATUSES.map((status) => {
                const count = tasks.filter((task) => task.status === status).length;
                const width = tasks.length ? (count / tasks.length) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-soft">
                        <span className={cn("size-1.5 rounded-full", STATUS_META[status].dot)} />
                        {STATUS_META[status].label}
                      </span>
                      <span className="text-[10px] font-semibold text-muted">{count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-surface-2 ring-1 ring-inset ring-line">
                      <div
                        className={cn("h-full rounded-full", STATUS_META[status].bar)}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="surface-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Task pipeline</h2>
              <p className="text-[11px] text-muted">A quick sample of work in the workspace</p>
            </div>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent transition hover:text-accent-strong"
            >
              Open tasks <ArrowRight className="size-3" />
            </Link>
          </div>
          {loading ? (
            <div className="grid gap-3 p-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={<ListTodo className="size-5" />}
                title="No tasks yet"
                description={
                  isAdmin
                    ? "Create the first task and it will appear here immediately."
                    : "An admin has not created any tasks yet. Check back soon."
                }
                action={
                  isAdmin ? (
                    <Button size="sm" onClick={() => setComposeOpen(true)} leadingIcon={<Plus className="size-4" />}>
                      Create task
                    </Button>
                  ) : undefined
                }
                className="border-0 py-10"
              />
            </div>
          ) : (
            <div className="grid gap-3 p-4 sm:grid-cols-3">
              {recentTasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
            </div>
          )}
        </section>

        <section className="surface-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Team</h2>
              <p className="text-[11px] text-muted">People in this workspace</p>
            </div>
            <Link
              href="/team"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent transition hover:text-accent-strong"
            >
              Directory <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="p-5">
            {usersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-2.5">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2.5 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted">
                No other members yet. Invite your team to get started.
              </p>
            ) : (
              <ul className="space-y-3">
                {users.slice(0, 4).map((member) => (
                  <li key={member.id}>
                    <Link
                      href={`/team/${member.id}`}
                      className="flex items-center gap-2.5 rounded-lg p-1 transition hover:bg-surface-2"
                    >
                      <Avatar name={member.username} src={member.profilePic} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold text-ink">
                          {member.username}
                        </p>
                        <p className="truncate text-[10px] text-muted">{member.email}</p>
                      </div>
                      <Badge
                        className={
                          member.status
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20"
                            : "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20"
                        }
                      >
                        {member.status ? "Active" : "Pending"}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-surface-2/60 px-3 py-2.5">
              <span className="flex items-center gap-1.5 text-[11px] text-muted">
                <Clock3 className="size-3.5" /> Workspace joined
              </span>
              <span className="text-[11px] font-semibold text-ink">
                {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </section>
      </div>

      <TaskFormModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSaved={() => refresh(true)}
      />
    </div>
  );
}
