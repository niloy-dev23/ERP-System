import type { Gender, Role, Task, TaskStatus } from "./types";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDate(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatRelative(value?: string | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 365 * 24 * 60 * 60 * 1000],
    ["month", 30 * 24 * 60 * 60 * 1000],
    ["week", 7 * 24 * 60 * 60 * 1000],
    ["day", 24 * 60 * 60 * 1000],
    ["hour", 60 * 60 * 1000],
    ["minute", 60 * 1000],
    ["second", 1000],
  ];
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, ms] of units) {
    if (abs >= ms || unit === "second") {
      return formatter.format(Math.round(diff / ms), unit);
    }
  }
  return "just now";
}

export type DeadlineState = "overdue" | "today" | "soon" | "upcoming" | "none";

export function deadlineState(value?: string): {
  state: DeadlineState;
  label: string;
} {
  if (!value) return { state: "none", label: "No deadline" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { state: "none", label: "No deadline" };

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDeadline = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDiff = Math.round(
    (startOfDeadline.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000),
  );

  if (date.getTime() < now.getTime() && dayDiff < 0) {
    return { state: "overdue", label: `Overdue ${formatRelative(date)}` };
  }
  if (dayDiff === 0) {
    return {
      state: "today",
      label: `Due today at ${new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(date)}`,
    };
  }
  if (dayDiff <= 3) {
    return { state: "soon", label: `Due ${formatRelative(date)}` };
  }
  return { state: "upcoming", label: `Due ${formatRelative(date)}` };
}

export const TASK_STATUSES: TaskStatus[] = ["todo", "pending", "archive", "done"];

export const STATUS_META: Record<
  TaskStatus,
  {
    label: string;
    description: string;
    badge: string;
    dot: string;
    column: string;
    bar: string;
  }
> = {
  todo: {
    label: "To do",
    description: "Ready to be picked up",
    badge:
      "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20",
    dot: "bg-slate-400",
    column: "border-slate-300/70 dark:border-slate-600/50",
    bar: "bg-slate-400",
  },
  pending: {
    label: "In progress",
    description: "Currently being worked on",
    badge:
      "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
    dot: "bg-amber-500",
    column: "border-amber-300/70 dark:border-amber-400/30",
    bar: "bg-amber-500",
  },
  archive: {
    label: "Archived",
    description: "Parked for later",
    badge:
      "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-400/10 dark:text-violet-300 dark:ring-violet-400/20",
    dot: "bg-violet-500",
    column: "border-violet-300/70 dark:border-violet-400/30",
    bar: "bg-violet-500",
  },
  done: {
    label: "Completed",
    description: "Shipped and closed",
    badge:
      "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
    dot: "bg-emerald-500",
    column: "border-emerald-300/70 dark:border-emerald-400/30",
    bar: "bg-emerald-500",
  },
};

export const ROLE_META: Record<
  Role,
  { label: string; className: string; description: string }
> = {
  admin: {
    label: "Admin",
    className:
      "bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-400/10 dark:text-teal-300 dark:ring-teal-400/20",
    description: "Full workspace access",
  },
  employee: {
    label: "Employee",
    className:
      "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20",
    description: "Team member",
  },
  user: {
    label: "Member",
    className:
      "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:ring-slate-400/20",
    description: "Standard access",
  },
};

export const GENDER_LABEL: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  others: "Other",
};

export function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const aTime = new Date(a.deadline).getTime();
    const bTime = new Date(b.deadline).getTime();
    const aValid = Number.isNaN(aTime) ? Number.MAX_SAFE_INTEGER : aTime;
    const bValid = Number.isNaN(bTime) ? Number.MAX_SAFE_INTEGER : bTime;
    return aValid - bValid;
  });
}

export function isTaskOverdue(task: Task) {
  if (task.status === "done") return false;
  const date = new Date(task.deadline);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() < Date.now();
}

/** Convert an ISO-ish date string to the value expected by datetime-local. */
export function toDateTimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

export function truncate(value: string, length = 120) {
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}...`;
}
