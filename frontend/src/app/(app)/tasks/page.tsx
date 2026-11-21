"use client";

import { useMemo, useState } from "react";
import {
  LayoutGrid,
  ListTodo,
  Plus,
  Rows3,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { PageHeader, EmptyState, Skeleton, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { TextInput } from "@/components/ui/form";
import { Alert } from "@/components/ui/alert";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { TaskBoard, TaskList } from "@/components/tasks/task-views";
import { useAuth } from "@/lib/auth-context";
import { useTasks } from "@/lib/hooks";
import type { TaskStatus } from "@/lib/types";
import {
  STATUS_META,
  TASK_STATUSES,
  cn,
  getAssignee,
  sortTasks,
} from "@/lib/utils";

type View = "board" | "list";
type StatusFilter = "all" | TaskStatus;
type SortKey = "deadline" | "title";

export default function TasksPage() {
  const { isAdmin } = useAuth();
  const { tasks, loading, error, refresh } = useTasks();
  const [view, setView] = useState<View>("board");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("deadline");
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    let next = tasks.filter((task) => {
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      const assignee = getAssignee(task);
      const matchesQuery =
        !query ||
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        Boolean(assignee?.username.toLowerCase().includes(query)) ||
        Boolean(assignee?.email?.toLowerCase().includes(query));
      return matchesStatus && matchesQuery;
    });

    if (sort === "title") {
      next = [...next].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      next = sortTasks(next);
    }
    return next;
  }, [tasks, statusFilter, search, sort]);

  const counts = useMemo(() => {
    const map = new Map<StatusFilter, number>([["all", tasks.length]]);
    TASK_STATUSES.forEach((status) => {
      map.set(status, tasks.filter((task) => task.status === status).length);
    });
    return map;
  }, [tasks]);

  const clearFilters = () => {
    setStatusFilter("all");
    setSearch("");
    setSort("deadline");
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title="Tasks"
        description="Plan, track, and move work through the pipeline. Deadlines and assigned owners come straight from the API."
        actions={
          isAdmin ? (
            <Button onClick={() => setComposeOpen(true)} leadingIcon={<Plus className="size-4" />}>
              New task
            </Button>
          ) : (
            <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[11px] font-medium text-muted">
              Read-only access
            </span>
          )
        }
      />

      {error ? (
        <Alert
          variant="error"
          title="Could not load tasks"
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

      <div className="surface-card p-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <TextInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, description, or assignee..."
              aria-label="Search tasks"
              leadingIcon={<Search className="size-4" />}
              className="h-9 rounded-lg text-[13px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="relative flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 text-[11px] font-medium text-muted">
              <SlidersHorizontal className="size-3.5" />
              <span className="sr-only">Sort tasks</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className="cursor-pointer appearance-none bg-transparent pr-1 text-[11px] font-semibold text-ink-soft outline-none"
                aria-label="Sort tasks"
              >
                <option value="deadline">By deadline</option>
                <option value="title">By title</option>
              </select>
            </label>

            <div className="flex items-center rounded-lg border border-line bg-surface p-0.5">
              {(
                [
                  { value: "board", label: "Board", icon: LayoutGrid },
                  { value: "list", label: "List", icon: Rows3 },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setView(option.value)}
                  aria-pressed={view === option.value}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-semibold transition",
                    view === option.value
                      ? "bg-accent-soft text-accent-ink"
                      : "text-muted hover:text-ink",
                  )}
                >
                  <option.icon className="size-3.5" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto border-t border-line pt-2.5">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
              statusFilter === "all"
                ? "bg-ink text-surface"
                : "text-muted hover:bg-surface-2 hover:text-ink",
            )}
          >
            All
            <span className="opacity-60">{tasks.length}</span>
          </button>
          {TASK_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                statusFilter === status
                  ? "bg-surface-2 text-ink ring-1 ring-line-strong"
                  : "text-muted hover:bg-surface-2 hover:text-ink",
              )}
            >
              <span className={cn("size-1.5 rounded-full", STATUS_META[status].dot)} />
              {STATUS_META[status].label}
              <span className="opacity-60">{counts.get(status) ?? 0}</span>
            </button>
          ))}
          <span className="ml-auto hidden shrink-0 pl-3 text-[10px] text-muted md:block">
            Showing {filtered.length} of {tasks.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2 rounded-2xl border border-line bg-surface-2/50 p-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ListTodo className="size-5" />}
          title={tasks.length === 0 ? "No tasks in the workspace yet" : "No tasks match these filters"}
          description={
            tasks.length === 0
              ? isAdmin
                ? "Create the first task to start tracking work against the API."
                : "Once an admin creates tasks, they will show up here."
              : "Try a different search term or clear the status filter."
          }
          action={
            tasks.length === 0 && isAdmin ? (
              <Button size="sm" onClick={() => setComposeOpen(true)} leadingIcon={<Plus className="size-4" />}>
                Create task
              </Button>
            ) : tasks.length > 0 ? (
              <Button size="sm" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : view === "board" ? (
        <TaskBoard tasks={filtered} />
      ) : (
        <TaskList tasks={filtered} />
      )}

      <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted">
        <Badge className="bg-surface text-muted ring-line">Tip</Badge>
        <span>
          Only admins can create, edit, or delete tasks. Everyone signed in can view the board.
        </span>
      </div>

      <TaskFormModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSaved={() => refresh(true)}
      />
    </div>
  );
}
