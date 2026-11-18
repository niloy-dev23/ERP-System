import Link from "next/link";
import { ArrowUpRight, CalendarClock, CheckCircle2, ChevronRight, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import type { Task, TaskStatus } from "@/lib/types";
import {
  STATUS_META,
  TASK_STATUSES,
  cn,
  deadlineState,
  isTaskOverdue,
  truncate,
} from "@/lib/utils";

const DEADLINE_STYLES: Record<string, string> = {
  overdue:
    "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20",
  today:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
  soon: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20",
  upcoming:
    "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20",
  none: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20",
  done: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
};

export function DeadlineBadge({ task, className }: { task: Task; className?: string }) {
  const done = task.status === "done";
  const { state, label } = deadlineState(task.deadline);
  const overdue = !done && isTaskOverdue(task);
  const palette = done ? "done" : overdue ? "overdue" : state;
  return (
    <Badge className={cn(DEADLINE_STYLES[palette], className)} dot={undefined}>
      {done ? <CheckCircle2 className="size-3" /> : <Clock3 className="size-3" />}
      {done
        ? "Completed"
        : overdue && state !== "overdue"
          ? `Overdue · ${label.replace("Due ", "")}`
          : label}
    </Badge>
  );
}

export function TaskCard({ task }: { task: Task }) {
  const meta = STATUS_META[task.status];
  return (
    <Link
      href={`/tasks/${task._id}`}
      className="group block rounded-xl border border-line bg-surface p-3.5 shadow-xs transition duration-150 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md hover:shadow-slate-900/5"
    >
      <div className="flex items-start justify-between gap-2">
        <Badge className={meta.badge} dot={meta.dot}>
          {meta.label}
        </Badge>
        <ArrowUpRight className="size-3.5 text-muted/60 transition group-hover:text-accent" />
      </div>
      <p className="mt-2.5 line-clamp-2 text-[13px] font-semibold leading-snug text-ink">
        {task.title}
      </p>
      <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted">
        {truncate(task.description, 110)}
      </p>
      <div className="mt-3 flex items-center gap-2 border-t border-line pt-2.5">
        <DeadlineBadge task={task} />
      </div>
    </Link>
  );
}

function ColumnIcon({ status }: { status: TaskStatus }) {
  return (
    <span className={cn("size-1.5 rounded-full", STATUS_META[status].dot)} aria-hidden />
  );
}

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const grouped = TASK_STATUSES.map((status) => ({
    status,
    items: tasks.filter((task) => task.status === status),
  }));

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {grouped.map(({ status, items }) => {
        const meta = STATUS_META[status];
        return (
          <section
            key={status}
            className={cn(
              "flex min-h-[220px] flex-col rounded-2xl border bg-surface-2/50 p-3",
              meta.column,
            )}
            aria-label={`${meta.label} tasks`}
          >
            <header className="flex items-center gap-2 px-1 pb-3">
              <ColumnIcon status={status} />
              <h2 className="text-xs font-semibold text-ink">{meta.label}</h2>
              <span className="ml-auto rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-muted ring-1 ring-line">
                {items.length}
              </span>
            </header>
            <div className="flex flex-1 flex-col gap-2.5">
              {items.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-line bg-surface/40 px-3 py-8 text-center">
                  <p className="text-[11px] leading-relaxed text-muted">
                    Nothing here yet.
                    <br />
                    <span className="text-[10px]">{meta.description}</span>
                  </p>
                </div>
              ) : (
                items.map((task) => <TaskCard key={task._id} task={task} />)
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="hidden items-center gap-4 border-b border-line bg-surface-2/60 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted md:flex">
        <span className="flex-1">Task</span>
        <span className="w-32">Status</span>
        <span className="w-52">Deadline</span>
        <span className="w-6" />
      </div>
      <div className="divide-y divide-line">
        {tasks.map((task) => {
          const meta = STATUS_META[task.status];
          return (
            <Link
              key={task._id}
              href={`/tasks/${task._id}`}
              className="group flex flex-col gap-2 px-4 py-3.5 transition hover:bg-surface-2/60 md:flex-row md:items-center md:gap-4"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", meta.dot)} />
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink">
                    {task.title}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">
                    {task.description}
                  </p>
                </div>
              </div>
              <div className="pl-5 md:w-32 md:pl-0">
                <Badge className={meta.badge}>{meta.label}</Badge>
              </div>
              <div className="pl-5 md:w-52 md:pl-0">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[11px]",
                    isTaskOverdue(task) ? "font-medium text-rose-600 dark:text-rose-400" : "text-muted",
                  )}
                >
                  <CalendarClock className="size-3.5" />
                  {deadlineState(task.deadline).label}
                </span>
              </div>
              <ChevronRight className="hidden size-4 text-muted/50 transition group-hover:translate-x-0.5 group-hover:text-accent md:block" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
