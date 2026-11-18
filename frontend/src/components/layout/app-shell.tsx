"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ChevronDown,
  Code2,
  ExternalLink,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme";
import { Avatar } from "@/components/ui/primitives";
import { useApiHealth } from "@/lib/hooks";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { ROLE_META, cn } from "@/lib/utils";

const NAV = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/tasks", label: "Tasks", icon: ListTodo },
      { href: "/team", label: "Team", icon: Users },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/profile", label: "Profile", icon: UserRound },
      { href: "/developers", label: "API explorer", icon: Code2 },
    ],
  },
];

const TITLES: Array<{ match: (path: string) => boolean; title: string }> = [
  { match: (p) => p === "/dashboard", title: "Overview" },
  { match: (p) => p.startsWith("/tasks/"), title: "Task details" },
  { match: (p) => p.startsWith("/tasks"), title: "Tasks" },
  { match: (p) => p.startsWith("/team/"), title: "Team member" },
  { match: (p) => p.startsWith("/team"), title: "Team" },
  { match: (p) => p.startsWith("/profile"), title: "Profile" },
  { match: (p) => p.startsWith("/developers"), title: "API explorer" },
];

function pageTitle(pathname: string) {
  return TITLES.find((entry) => entry.match(pathname))?.title ?? "Workspace";
}

function HealthPill() {
  const status = useApiHealth();
  const styles = {
    checking: "bg-amber-400",
    online: "bg-emerald-500",
    offline: "bg-rose-500",
  }[status];
  const label = {
    checking: "Checking API",
    online: "API connected",
    offline: "API offline",
  }[status];

  return (
    <span
      title={label}
      className="hidden items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-medium text-muted sm:inline-flex"
    >
      <span className={cn("size-1.5 rounded-full", styles)} aria-hidden />
      {label}
    </span>
  );
}

function UserMenu() {
  const { user, logout, isAdmin } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const docsUrl =
    process.env.NEXT_PUBLIC_API_DOCS_URL ?? "http://localhost:8000/api-docs";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
      toast.success("Signed out", "Your session has been closed.");
    } finally {
      setSigningOut(false);
    }
  };

  const roleMeta = user?.role ? ROLE_META[user.role] : null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-xl border border-transparent p-1 pr-1.5 transition hover:border-line hover:bg-surface"
      >
        <Avatar name={user?.username} src={user?.profilePic} size="sm" />
        <span className="hidden min-w-0 text-left leading-tight sm:block">
          <span className="block max-w-[9rem] truncate text-[13px] font-semibold text-ink">
            {user?.username ?? "Account"}
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-wide text-muted">
            {isAdmin ? "Administrator" : roleMeta?.label ?? "Member"}
          </span>
        </span>
        <ChevronDown
          className={cn("size-3.5 text-muted transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-xl border border-line bg-surface p-1.5 shadow-xl"
        >
          <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
            <Avatar name={user?.username} src={user?.profilePic} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {user?.username}
              </p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-line" />
          <Link
            href="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-ink-soft transition hover:bg-surface-2 hover:text-ink"
          >
            <UserRound className="size-4 text-muted" /> Account settings
          </Link>
          <a
            href={docsUrl}
            target="_blank"
            rel="noreferrer"
            role="menuitem"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-ink-soft transition hover:bg-surface-2 hover:text-ink"
          >
            <ExternalLink className="size-4 text-muted" /> Swagger UI
          </a>
          <div className="my-1 h-px bg-line" />
          <button
            type="button"
            role="menuitem"
            onClick={handleLogout}
            disabled={signingOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <LogOut className="size-4" />
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();
  const roleMeta = user?.role ? ROLE_META[user.role] : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Brand href="/dashboard" />
        <span className="lg:hidden">
          <button
            type="button"
            onClick={onNavigate}
            className="rounded-lg p-1.5 text-muted hover:bg-surface-2 hover:text-ink"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV.map((section) => (
          <div key={section.label}>
            <p className="px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted/80">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition",
                      active
                        ? "bg-accent-soft text-accent-ink"
                        : "text-ink-soft hover:bg-surface-2 hover:text-ink",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4",
                        active ? "text-accent" : "text-muted group-hover:text-ink-soft",
                      )}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.href === "/team" && isAdmin ? (
                      <span className="rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-muted ring-1 ring-line">
                        Admin
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="space-y-3 border-t border-line p-3">
        <div className="rounded-xl border border-line bg-surface-2/70 p-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-ink-soft">
            <Activity className="size-3.5 text-accent" />
            Backend session
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted">
            {roleMeta ? `${roleMeta.label} access` : "Member access"} · Tokens
            auto-refresh
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl px-1 py-1">
          <Avatar name={user?.username} src={user?.profilePic} size="xs" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-ink">
              {user?.username}
            </p>
            <p className="truncate text-[10px] text-muted">{user?.email}</p>
          </div>
          <Link
            href="/profile"
            onClick={onNavigate}
            className="rounded-md p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink"
            aria-label="Open profile"
          >
            <UserRound className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-dvh bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[268px] border-r border-line bg-surface/85 backdrop-blur lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
          />
          <div className="relative h-full w-[280px] border-r border-line bg-surface shadow-2xl animate-[fade-in_0.2s_ease-out_both]">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[268px]">
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="-ml-1 rounded-lg border border-line bg-surface p-2 text-muted transition hover:text-ink lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="size-4" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {pageTitle(pathname)}
              </p>
              <p className="hidden text-[11px] text-muted sm:block">
                TaskFlow workspace
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <HealthPill />
              <ThemeToggle />
              <UserMenu />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>

        <footer className="mx-auto w-full max-w-[1440px] px-4 pb-8 pt-2 text-[11px] text-muted sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
            <span>TaskFlow · connected to the Express API</span>
            <a
              href={
                process.env.NEXT_PUBLIC_API_DOCS_URL ??
                "http://localhost:8000/api-docs"
              }
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 transition hover:text-ink"
            >
              API reference <ExternalLink className="size-3" />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
