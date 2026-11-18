"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CircleAlert,
  Hash,
  Mail,
  MapPin,
  PauseCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Avatar, Badge, EmptyState, Skeleton } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/modal";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import type { UserRecord } from "@/lib/types";
import {
  GENDER_LABEL,
  ROLE_META,
  formatDate,
  formatDateTime,
  getErrorMessage,
} from "@/lib/utils";

export default function TeamMemberPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { user: currentUser, isAdmin } = useAuth();
  const toast = useToast();

  const [member, setMember] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmPause, setConfirmPause] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .getUser(id)
      .then((data) => {
        if (alive) {
          setMember(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (alive) setError(getErrorMessage(err, "Could not load this member"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const isSelf = member?.id === currentUser?.id;

  const toggleApproval = async (approve: boolean) => {
    if (!member) return;
    setBusy(true);
    try {
      if (approve) await api.approveUser(member.id);
      else await api.disapproveUser(member.id);
      setMember({ ...member, status: approve });
      toast.success(
        approve ? "Member approved" : "Member paused",
        `${member.username} is now ${approve ? "active" : "pending"}.`,
      );
      setConfirmPause(false);
    } catch (err) {
      toast.error("Could not update member", getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <EmptyState
        icon={<CircleAlert className="size-5" />}
        title="Member not available"
        description={error ?? "This account may no longer exist."}
        action={
          <Button variant="outline" size="sm" onClick={() => router.push("/team")}>
            Back to team
          </Button>
        }
      />
    );
  }

  const roleMeta = member.role ? ROLE_META[member.role] : ROLE_META.user;

  return (
    <div className="space-y-5">
      <Link
        href="/team"
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Back to team
      </Link>

      <section className="surface-card relative overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-teal-500/10 via-sky-500/5 to-transparent" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={member.username} src={member.profilePic} size="xl" ring />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-ink">
                  {member.username}
                  {isSelf ? <span className="ml-1.5 text-xs font-medium text-muted">(you)</span> : null}
                </h1>
                {member.isEmailVerified ? (
                  <BadgeCheck className="size-4 text-emerald-500" aria-label="Email verified" />
                ) : null}
              </div>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                <Mail className="size-3.5" /> {member.email}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <Badge className={roleMeta.className}>{roleMeta.label}</Badge>
                <Badge
                  className={
                    member.status
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20"
                      : "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20"
                  }
                >
                  {member.status ? "Active" : "Pending approval"}
                </Badge>
                <Badge className="bg-surface text-muted ring-line">
                  {member.isEmailVerified ? "Email verified" : "Email unverified"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isSelf ? (
              <Link
                href="/profile"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-[12px] font-semibold text-surface transition hover:opacity-90"
              >
                Edit your profile <ArrowRight className="size-3.5" />
              </Link>
            ) : null}
            {isAdmin && !isSelf ? (
              member.status ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmPause(true)}
                  leadingIcon={<PauseCircle className="size-3.5" />}
                >
                  Pause account
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => toggleApproval(true)}
                  loading={busy}
                  leadingIcon={<Check className="size-3.5" />}
                >
                  Approve account
                </Button>
              )
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface-card">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
              <UserRound className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink">Profile</h2>
              <p className="text-[11px] text-muted">Member-provided details</p>
            </div>
          </div>
          <dl className="divide-y divide-line px-5">
            {[
              {
                label: "Email address",
                value: member.email,
                icon: Mail,
              },
              {
                label: "Address",
                value: member.address || "Not provided",
                icon: MapPin,
              },
              {
                label: "Gender",
                value: member.gender ? GENDER_LABEL[member.gender] : "Not provided",
                icon: UserRound,
              },
              {
                label: "Joined",
                value: formatDate(member.createdAt),
                icon: CalendarDays,
              },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 py-3.5">
                <dt className="flex items-center gap-1.5 text-[11px] text-muted">
                  <row.icon className="size-3.5" /> {row.label}
                </dt>
                <dd className="max-w-[60%] truncate text-right text-xs font-medium text-ink-soft">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="surface-card">
          <div className="flex items-center gap-2 border-b border-line px-5 py-4">
            <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
              <ShieldCheck className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-ink">Account</h2>
              <p className="text-[11px] text-muted">Role, status, and identifiers</p>
            </div>
          </div>
          <dl className="divide-y divide-line px-5">
            <div className="flex items-center justify-between gap-4 py-3.5">
              <dt className="text-[11px] text-muted">Role</dt>
              <dd>
                <Badge className={roleMeta.className}>{roleMeta.label}</Badge>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3.5">
              <dt className="text-[11px] text-muted">Access status</dt>
              <dd className="text-xs font-medium text-ink-soft">
                {member.status ? "Active" : "Awaiting admin approval"}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3.5">
              <dt className="text-[11px] text-muted">Member since</dt>
              <dd className="text-xs font-medium text-ink-soft">
                {formatDate(member.createdAt)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3.5">
              <dt className="text-[11px] text-muted">Last updated</dt>
              <dd className="text-xs font-medium text-ink-soft">
                {formatDateTime(member.updatedAt)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3.5">
              <dt className="flex items-center gap-1.5 text-[11px] text-muted">
                <Hash className="size-3" /> User ID
              </dt>
              <dd className="max-w-[62%] truncate font-mono text-[10px] text-muted">
                {member.id}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {!isAdmin ? (
        <Alert variant="info" title="View only">
          Account approval and status changes are restricted to workspace admins.
        </Alert>
      ) : null}

      <ConfirmDialog
        open={confirmPause}
        onClose={() => setConfirmPause(false)}
        onConfirm={() => toggleApproval(false)}
        loading={busy}
        title="Pause this account?"
        description={`${member.username} will be marked as pending. This changes their status in the backend; it does not delete their account.`}
        confirmLabel="Pause account"
      />
    </div>
  );
}
