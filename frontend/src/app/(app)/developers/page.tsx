"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  ExternalLink,
  KeyRound,
  Lock,
  Search,
  ServerCog,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { PageHeader, Badge } from "@/components/ui/primitives";
import { TextInput } from "@/components/ui/form";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/lib/toast-context";
import { useApiHealth } from "@/lib/hooks";
import { cn } from "@/lib/utils";

type Method = "GET" | "POST" | "PATCH" | "DELETE";

const METHOD_STYLES: Record<Method, string> = {
  GET: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-400/20",
  POST: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  PATCH:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
  DELETE:
    "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20",
};

interface Endpoint {
  method: Method;
  path: string;
  description: string;
  auth: boolean;
  admin?: boolean;
}

const GROUPS: Array<{ name: string; description: string; endpoints: Endpoint[] }> = [
  {
    name: "Authentication",
    description: "Registration, verification, sessions, and password recovery.",
    endpoints: [
      { method: "POST", path: "/registration", description: "Create an account and send a verification email.", auth: false },
      { method: "GET", path: "/verify-email?token=...", description: "Verify an email address with a token.", auth: false },
      { method: "POST", path: "/verify-email", description: "Verify an email address with a token in the body.", auth: false },
      { method: "POST", path: "/resend-verification", description: "Request a fresh verification email.", auth: false },
      { method: "POST", path: "/login", description: "Sign in and receive access + refresh tokens. Rate limited to 3 / 15 min.", auth: false },
      { method: "POST", path: "/refresh", description: "Rotate the refresh token and issue a new access token.", auth: false },
      { method: "POST", path: "/logout", description: "Revoke the stored refresh token.", auth: false },
      { method: "POST", path: "/forgot-password", description: "Request a single-use password reset email.", auth: false },
      { method: "POST", path: "/reset-password", description: "Set a new password using a reset token.", auth: false },
    ],
  },
  {
    name: "Users",
    description: "Profiles, the workspace directory, and admin approvals.",
    endpoints: [
      { method: "GET", path: "/me", description: "Return the authenticated user's safe profile.", auth: true },
      { method: "GET", path: "/getAll?search=&role=", description: "List other users, optionally filtered by name or role.", auth: true },
      { method: "GET", path: "/getSingle/:id", description: "Fetch a single user document by ID.", auth: true },
      { method: "PATCH", path: "/update/:id", description: "Update user fields such as username, address, or avatar URL.", auth: true },
      { method: "PATCH", path: "/approve/:id", description: "Mark a member account as active.", auth: true, admin: true },
      { method: "PATCH", path: "/disapprove/:id", description: "Mark a member account as pending.", auth: true, admin: true },
    ],
  },
  {
    name: "Tasks",
    description:
      "Task retrieval for every member and mutations for admins. Responses include the populated assignee.",
    endpoints: [
      { method: "GET", path: "/getAllTask", description: "Retrieve every task with its assigned member populated.", auth: true },
      { method: "GET", path: "/getSingleTask/:id", description: "Fetch one task by ID, including its assignee.", auth: true },
      { method: "POST", path: "/createTask", description: "Create a task with title, description, deadline, status, and assignedTo.", auth: true, admin: true },
      { method: "PATCH", path: "/updateTask/:id", description: "Update task fields, including the assigned member.", auth: true, admin: true },
      { method: "DELETE", path: "/deleteTask/:id", description: "Permanently remove a task.", auth: true, admin: true },
    ],
  },
];

export default function DevelopersPage() {
  const toast = useToast();
  const status = useApiHealth();
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const docsUrl =
    process.env.NEXT_PUBLIC_API_DOCS_URL ?? "http://localhost:8000/api-docs";
  const total = GROUPS.reduce((sum, group) => sum + group.endpoints.length, 0);

  const query = search.trim().toLowerCase();
  const groups = GROUPS.map((group) => ({
    ...group,
    endpoints: group.endpoints.filter(
      (endpoint) =>
        !query ||
        endpoint.path.toLowerCase().includes(query) ||
        endpoint.description.toLowerCase().includes(query) ||
        group.name.toLowerCase().includes(query),
    ),
  })).filter((group) => group.endpoints.length > 0);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      toast.success("Copied", text);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Clipboard unavailable", "Copy the path manually.");
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Developer"
        title="API explorer"
        description="A map of every backend capability this frontend uses, proxied through Next.js so the Express app needs no CORS changes."
        actions={
          <a
            href={docsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-[12px] font-semibold text-surface transition hover:opacity-90"
          >
            Open Swagger UI <ExternalLink className="size-3.5" />
          </a>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="surface-card flex items-center gap-3 p-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
            <ServerCog className="size-4" />
          </span>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted">Backend</p>
            <p className="text-xs font-semibold text-ink">Express · /api/v1</p>
          </div>
          <span
            className={cn(
              "ml-auto size-2 rounded-full",
              status === "online" ? "bg-emerald-500" : status === "offline" ? "bg-rose-500" : "bg-amber-500",
            )}
            title={status}
          />
        </div>
        <div className="surface-card flex items-center gap-3 p-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400">
            <ShieldCheck className="size-4" />
          </span>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted">Auth scheme</p>
            <p className="text-xs font-semibold text-ink">Bearer JWT</p>
          </div>
        </div>
        <div className="surface-card flex items-center gap-3 p-4">
          <span className="flex size-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-400/10 dark:text-violet-400">
            <Code2 className="size-4" />
          </span>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted">Documented</p>
            <p className="text-xs font-semibold text-ink">{total} endpoints</p>
          </div>
        </div>
      </div>

      <div className="surface-card p-5">
        <h2 className="text-sm font-semibold text-ink">Same-origin request flow</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          {[
            { label: "Browser", detail: "/api/backend/*", tone: "bg-surface-2" },
            { label: "Next.js rewrite", detail: "proxy, no CORS", tone: "bg-accent-soft text-accent-ink" },
            { label: "Express API", detail: "/api/v1/*", tone: "bg-surface-2" },
          ].map((node, index) => (
            <div key={node.label} className="contents">
              <div className={cn("rounded-xl border border-line px-3.5 py-3", node.tone)}>
                <p className="text-[11px] font-semibold text-ink">{node.label}</p>
                <p className="mt-0.5 font-mono text-[10px] text-muted">{node.detail}</p>
              </div>
              {index < 2 ? (
                <ArrowRight className="mx-auto hidden size-4 text-muted/60 sm:block" />
              ) : null}
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted">
          The rewrite destination is configured by <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[10px] text-ink-soft">BACKEND_URL</code> and{" "}
          <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[10px] text-ink-soft">BACKEND_API_PREFIX</code> in{" "}
          <code className="rounded bg-surface-2 px-1 py-0.5 font-mono text-[10px] text-ink-soft">.env.local</code>.
        </p>
      </div>

      <div className="surface-card flex flex-col gap-2.5 p-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <TextInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter endpoints..."
            aria-label="Filter endpoints"
            leadingIcon={<Search className="size-4" />}
            className="h-9 rounded-lg text-[13px]"
          />
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted">
          <span className="inline-flex items-center gap-1">
            <Lock className="size-3" /> Requires Bearer token
          </span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="size-3" /> Admin only
          </span>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line px-5 py-12 text-center text-xs text-muted">
          No endpoints match &ldquo;{search}&rdquo;.
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <section key={group.name} className="surface-card overflow-hidden">
              <div className="flex flex-col gap-1 border-b border-line bg-surface-2/50 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink">
                    {group.name}
                  </h2>
                  <p className="text-[11px] text-muted">{group.description}</p>
                </div>
                <span className="text-[10px] font-medium text-muted">
                  {group.endpoints.length} endpoint
                  {group.endpoints.length === 1 ? "" : "s"}
                </span>
              </div>
              <ul className="divide-y divide-line">
                {group.endpoints.map((endpoint) => {
                  const key = `${endpoint.method} ${endpoint.path}`;
                  return (
                    <li
                      key={key}
                      className="flex flex-col gap-2 px-5 py-3.5 transition hover:bg-surface-2/40 sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                        <Badge className={cn("w-14 justify-center font-mono", METHOD_STYLES[endpoint.method])}>
                          {endpoint.method}
                        </Badge>
                        <code className="truncate font-mono text-[11px] font-medium text-ink">
                          {endpoint.path}
                        </code>
                        {endpoint.admin ? (
                          <Badge className="bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20">
                            Admin
                          </Badge>
                        ) : null}
                        {endpoint.auth ? (
                          <Lock className="size-3 text-muted" aria-label="Requires authentication" />
                        ) : null}
                      </div>
                      <p className="text-[11px] text-muted sm:max-w-[46%] sm:text-right">
                        {endpoint.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => copy(endpoint.path.replace("...", ""))}
                        className="inline-flex size-7 shrink-0 items-center justify-center self-start rounded-md text-muted transition hover:bg-surface-2 hover:text-ink sm:self-auto"
                        aria-label={`Copy ${endpoint.method} ${endpoint.path}`}
                      >
                        {copied === endpoint.path.replace("...", "") ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <Terminal className="size-4 text-accent" />
            <h2 className="text-sm font-semibold text-ink">Quick start with curl</h2>
          </div>
          <pre className="overflow-x-auto bg-[#0b1220] p-5 font-mono text-[11px] leading-6 text-slate-300">
            <code>{`curl -X POST http://localhost:8000/api/v1/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"you@example.com","password":"your-password"}'

# use the returned accessToken
curl http://localhost:8000/api/v1/getAllTask \\
  -H "Authorization: Bearer $TOKEN"`}</code>
          </pre>
        </section>

        <section className="surface-card">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <KeyRound className="size-4 text-accent" />
            <h2 className="text-sm font-semibold text-ink">Response contract</h2>
          </div>
          <div className="space-y-3 px-5 py-4">
            <p className="text-[11px] leading-relaxed text-muted">
              Every endpoint returns a consistent envelope. Errors carry a
              human-readable message that the UI surfaces directly.
            </p>
            <pre className="overflow-x-auto rounded-xl border border-line bg-surface-2/60 p-3.5 font-mono text-[10px] leading-5 text-ink-soft">
              <code>{`{
  "success": true,
  "message": "Tasks Retrieved Successfully",
  "data": [
    {
      "_id": "task-id",
      "title": "Ship the release",
      "status": "todo",
      "assignedTo": {
        "_id": "user-id",
        "username": "Ada Lovelace",
        "email": "ada@example.com",
        "role": "employee"
      }
    }
  ]
}`}</code>
            </pre>
            <Alert variant="info" title="Status codes to expect">
              401 for expired or missing tokens (the client refreshes once),
              403 for unverified emails or non-admin mutations, 429 after three
              login attempts within 15 minutes.
            </Alert>
          </div>
        </section>
      </div>
    </div>
  );
}
