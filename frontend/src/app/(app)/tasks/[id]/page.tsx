"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  CircleAlert,
  Clock3,
  FileText,
  Hash,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import { Avatar, Badge, EmptyState, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/modal";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import type { Task } from "@/lib/types";
import {
  ROLE_META,
  STATUS_META,
  assigneeId,
  cn,
  deadlineState,
  formatDateTime,
  getAssignee,
  getErrorMessage,
  isTaskOverdue,
} from "@/lib/utils";

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .getTask(id)
      .then((data) => {
        if (alive) {
          setTask(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (alive) setError(getErrorMessage(err, "Could not load this task"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const remove = async () => {
    if (!task) return;
    setDeleting(true);
    try {
      await api.deleteTask(task._id);
      toast.success("Task deleted", task.title);
      router.replace("/tasks");
    } catch (err) {
      toast.error("Could not delete task", getErrorMessage(err));
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-2/3" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <EmptyState
        icon={<CircleAlert className="size-5" />}
        title="Task not available"
        description={error ?? "This task may have been deleted or the link is invalid."}
        action={
          <Button variant="outline" size="sm" onClick={() => router.push("/tasks")}>
            Back to tasks
          </Button>
        }
      />
    );
  }

  const meta = STATUS_META[task.status];
  const due = deadlineState(task.deadline);
  const overdue = isTaskOverdue(task);
  const assignee = getAssignee(task);
  const assigneeKey = assigneeId(task);
  const assigneeRole = assignee?.role ? ROLE_META[assignee.role] : null;

  return (
    <div className="space-y-5">
      <Link
        href="/tasks"
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Back to tasks
      </Link>

      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={meta.badge} dot={meta.dot}>
              {meta.label}
            </Badge>
            {overdue ? (
              <Badge className="bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20">
                Overdue
              </Badge>
            ) : null}
          </div>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight text-ink sm:text-3xl">
            {task.title}
          </h1>
          <p className="flex items-center gap-1.5 text-[11px] text-muted">
            <Hash className="size-3" />
            <span className="font-mono">{task._id}</span>
          </p>
        </div>

        {isAdmin ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              leadingIcon={<Pencil className="size-3.5" />}
            >
              Edit
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              leadingIcon={<Trash2 className="size-3.5" />}
            >
              Delete
            </Button>
          </div>
        ) : (
          <span className="inline-flex h-8 items-center gap-1.5 self-start rounded-lg border border-line bg-surface px-3 text-[10px] font-medium text-muted">
            Read-only access
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="surface-card lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
              <FileText className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink">Description</h2>
              <p className="text-[11px] text-muted">What this task covers</p>
            </div>
          </div>
          <div className="px-5 py-5">
            <p className="whitespace-pre-wrap text-[13px] leading-7 text-ink-soft">
              {task.description}
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="surface-card">
            <div className="flex items-center gap-2 border-b border-line px-5 py-4">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                <UserRound className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-ink">Assignment</h2>
                <p className="text-[11px] text-muted">Who owns this task</p>
              </div>
            </div>
            <div className="px-5 py-4">
              {assignee ? (
                <div className="flex items-center gap-3">
                  <Avatar name={assignee.username} size="md" />
                  <div className="min-w-0 flex-1">
                    {assigneeKey ? (
                      <Link
                        href={`/team/${assigneeKey}`}
                        className="block truncate text-[13px] font-semibold text-ink transition hover:text-accent"
                      >
                        {assignee.username}
                      </Link>
                    ) : (
                      <p className="truncate text-[13px] font-semibold text-ink">
                        {assignee.username}
                      </p>
                    )}
                    {assignee.email ? (
                      <p className="truncate text-[11px] text-muted">{assignee.email}</p>
                    ) : null}
                    {assigneeRole ? (
                      <Badge className={cn("mt-1.5", assigneeRole.className)}>
                        {assigneeRole.label}
                      </Badge>
                    ) : null}
                  </div>
                  {assigneeKey ? (
                    <Link
                      href={`/team/${assigneeKey}`}
                      className="rounded-md p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink"
                      aria-label={`View ${assignee.username}'s profile`}
                    >
                      <ArrowUpRight className="size-3.5" />
                    </Link>
                  ) : null}
                </div>
              ) : (
                <p className="text-[11px] leading-relaxed text-muted">
                  No workspace member is assigned to this task yet.
                </p>
              )}
            </div>
          </section>

          <section className="surface-card">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-sm font-semibold text-ink">Schedule</h2>
              <p className="text-[11px] text-muted">Deadline and progress</p>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div className="rounded-xl border border-line bg-surface-2/60 p-3.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                    <CalendarClock className="size-3.5" /> Deadline
                  </span>
                  <Badge
                    className={cn(
                      overdue
                        ? "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20"
                        : "bg-surface text-muted ring-line",
                    )}
                  >
                    {overdue ? "Overdue" : due.state === "today" ? "Today" : "Scheduled"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {formatDateTime(task.deadline)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">{due.label}</p>
              </div>

              <dl className="space-y-3 text-[12px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Status</dt>
                  <dd>
                    <Badge className={meta.badge} dot={meta.dot}>
                      {meta.label}
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted">Stage meaning</dt>
                  <dd className="max-w-[60%] text-right text-[11px] text-ink-soft">
                    {meta.description}
                  </dd>
                </div>
                {task.createdAt ? (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted">Created</dt>
                    <dd className="text-ink-soft">{formatDateTime(task.createdAt)}</dd>
                  </div>
                ) : null}
                {task.updatedAt ? (
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted">Updated</dt>
                    <dd className="text-ink-soft">{formatDateTime(task.updatedAt)}</dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                  <dt className="flex items-center gap-1.5 text-muted">
                    <Clock3 className="size-3.5" /> Deadline state
                  </dt>
                  <dd className="text-ink-soft capitalize">{due.state}</dd>
                </div>
              </dl>
            </div>
          </section>

          {overdue ? (
            <Alert variant="warning" title="This task is past due">
              Update the deadline or mark the work as completed when it is done.
            </Alert>
          ) : null}
        </aside>
      </div>

      <TaskFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        task={task}
        onSaved={(saved) => {
          if (saved) setTask(saved);
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={remove}
        loading={deleting}
        title="Delete this task?"
        description={`"${task.title}" will be permanently removed from the workspace. This action cannot be undone.`}
        confirmLabel="Delete task"
      />
    </div>
  );
}
