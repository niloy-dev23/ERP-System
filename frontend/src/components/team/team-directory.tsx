"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BadgeCheck,
  Check,
  Mail,
  PauseCircle,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { PageHeader, Avatar, Badge, EmptyState, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Select, TextInput } from "@/components/ui/form";
import { Alert } from "@/components/ui/alert";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useUsers } from "@/lib/hooks";
import { useToast } from "@/lib/toast-context";
import type { Role, UserRecord } from "@/lib/types";
import { GENDER_LABEL, ROLE_META, cn, formatDate, getErrorMessage } from "@/lib/utils";

type StatusFilter = "all" | "active" | "pending";

export function TeamDirectory() {
  const params = useSearchParams();
  const { user: currentUser, isAdmin } = useAuth();
  const { users, loading, error, refresh, setUsers } = useUsers();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"all" | Role>("all");
  const [status, setStatus] = useState<StatusFilter>(
    params.get("status") === "pending" ? "pending" : "all",
  );
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((member) => {
      const matchesQuery =
        !query ||
        member.username.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query);
      const matchesRole = role === "all" || member.role === role;
      const matchesStatus =
        status === "all" ||
        (status === "active" ? Boolean(member.status) : !member.status);
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, search, role, status]);

  const pendingCount = users.filter((member) => !member.status).length;
  const activeCount = users.filter((member) => member.status).length;

  const toggleApproval = async (member: UserRecord, approve: boolean) => {
    setBusyId(member.id);
    try {
      if (approve) await api.approveUser(member.id);
      else await api.disapproveUser(member.id);
      setUsers((current) =>
        current.map((item) =>
          item.id === member.id ? { ...item, status: approve } : item,
        ),
      );
      toast.success(
        approve ? "Member approved" : "Member paused",
        `${member.username} is now ${approve ? "active" : "pending"}.`,
      );
    } catch (err) {
      toast.error("Could not update member", getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title="Team directory"
        description="Everyone with an account in this workspace. Admins can approve or pause members."
        actions={
          <span className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 text-[11px] font-medium text-muted">
            <Users className="size-3.5" /> {users.length} member
            {users.length === 1 ? "" : "s"}
          </span>
        }
      />

      {error ? (
        <Alert
          variant="error"
          title="Could not load the team"
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

      {isAdmin && pendingCount > 0 ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-amber-400/20 dark:bg-amber-400/5">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-[13px] font-semibold text-amber-900 dark:text-amber-200">
                {pendingCount} account{pendingCount === 1 ? "" : "s"} pending approval
              </p>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-200/70">
                New accounts start as pending. Approve members to mark them active.
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="self-start border-amber-300 bg-white/70 text-amber-900 hover:bg-white dark:border-amber-400/30 dark:bg-transparent dark:text-amber-200 sm:self-auto" onClick={() => setStatus("pending")}>
            View pending
          </Button>
        </div>
      ) : null}

      <div className="surface-card flex flex-col gap-2.5 p-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <TextInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email..."
            aria-label="Search team"
            leadingIcon={<Search className="size-4" />}
            className="h-9 rounded-lg text-[13px]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={role}
            onChange={(event) => setRole(event.target.value as "all" | Role)}
            aria-label="Filter by role"
            className="h-9 w-auto min-w-[130px] rounded-lg text-[11px] font-semibold"
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
            <option value="user">Member</option>
          </Select>

          <div className="flex items-center rounded-lg border border-line bg-surface p-0.5">
            {(
              [
                { value: "all", label: "All" },
                { value: "active", label: `Active ${activeCount}` },
                { value: "pending", label: `Pending ${pendingCount}` },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatus(option.value)}
                aria-pressed={status === option.value}
                className={cn(
                  "h-8 rounded-md px-2.5 text-[11px] font-semibold transition",
                  status === option.value
                    ? "bg-accent-soft text-accent-ink"
                    : "text-muted hover:text-ink",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<UserRound className="size-5" />}
          title={users.length === 0 ? "No other members yet" : "No members match these filters"}
          description={
            users.length === 0
              ? "The directory excludes your own account. Invite teammates to register and they will appear here."
              : "Try a different search term or reset the role and status filters."
          }
          action={
            users.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setRole("all");
                  setStatus("all");
                }}
              >
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((member) => {
            const roleMeta = member.role ? ROLE_META[member.role] : ROLE_META.user;
            const isSelf = member.id === currentUser?.id;
            return (
              <div
                key={member.id}
                className="surface-card flex flex-col p-4 transition hover:border-line-strong hover:shadow-md hover:shadow-slate-900/5"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={member.username} src={member.profilePic} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/team/${member.id}`}
                        className="truncate text-[13px] font-semibold text-ink transition hover:text-accent"
                      >
                        {isSelf ? `${member.username} (you)` : member.username}
                      </Link>
                      {member.isEmailVerified ? (
                        <BadgeCheck
                          className="size-3.5 shrink-0 text-emerald-500"
                          aria-label="Email verified"
                        />
                      ) : null}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted">
                      <Mail className="size-3 shrink-0" /> {member.email}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge className={roleMeta.className}>{roleMeta.label}</Badge>
                      <Badge
                        className={
                          member.status
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20"
                            : "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20"
                        }
                      >
                        {member.status ? "Active" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3 text-[10px]">
                  <div>
                    <dt className="text-muted">Gender</dt>
                    <dd className="mt-0.5 font-medium text-ink-soft">
                      {member.gender ? GENDER_LABEL[member.gender] : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Joined</dt>
                    <dd className="mt-0.5 font-medium text-ink-soft">
                      {formatDate(member.createdAt)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/team/${member.id}`}
                    className="inline-flex h-8 flex-1 items-center justify-center rounded-lg border border-line bg-surface text-[11px] font-semibold text-ink-soft transition hover:bg-surface-2 hover:text-ink"
                  >
                    View profile
                  </Link>
                  {isAdmin && !isSelf ? (
                    member.status ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-[11px]"
                        onClick={() => toggleApproval(member, false)}
                        loading={busyId === member.id}
                        leadingIcon={<PauseCircle className="size-3.5" />}
                      >
                        Pause
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="h-8 px-2.5 text-[11px]"
                        onClick={() => toggleApproval(member, true)}
                        loading={busyId === member.id}
                        leadingIcon={<Check className="size-3.5" />}
                      >
                        Approve
                      </Button>
                    )
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-muted">
        Note: the API excludes your own account from this listing. Manage your
        details from the profile page.
      </p>
    </div>
  );
}
