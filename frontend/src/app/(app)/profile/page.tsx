"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { PageHeader, Avatar, Badge } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Field, Select, TextInput } from "@/components/ui/form";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import type { Gender } from "@/lib/types";
import {
  GENDER_LABEL,
  ROLE_META,
  formatDate,
  formatDateTime,
  getErrorMessage,
} from "@/lib/utils";

export default function ProfilePage() {
  const { user, isAdmin, refreshUser, logout } = useAuth();
  const toast = useToast();

  const [username, setUsername] = useState(user?.username ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [gender, setGender] = useState<Gender | "">(user?.gender ?? "");
  const [profilePic, setProfilePic] = useState(user?.profilePic ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  if (!user) return null;

  const roleMeta = user.role ? ROLE_META[user.role] : ROLE_META.user;

  const dirty =
    username !== (user.username ?? "") ||
    address !== (user.address ?? "") ||
    gender !== (user.gender ?? "") ||
    profilePic !== (user.profilePic ?? "");

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (username.trim().length < 2) {
      setError("Your name needs at least 2 characters.");
      return;
    }
    if (profilePic && !/^https?:\/\/.+/.test(profilePic.trim())) {
      setError("Profile picture must be a valid http(s) URL.");
      return;
    }

    setSaving(true);
    try {
      await api.updateUser(user.id, {
        username: username.trim(),
        address: address.trim() || undefined,
        gender: (gender || undefined) as Gender | undefined,
        profilePic: profilePic.trim() || undefined,
      });
      await refreshUser();
      toast.success("Profile updated", "Your changes were saved to the API.");
    } catch (err) {
      setError(getErrorMessage(err, "Could not save your profile"));
    } finally {
      setSaving(false);
    }
  };

  const sendReset = async () => {
    setSendingReset(true);
    try {
      await api.forgotPassword(user.email);
      toast.success(
        "Reset link requested",
        "If email delivery is configured, a link is on its way.",
      );
    } catch (err) {
      toast.error("Could not request a reset link", getErrorMessage(err));
    } finally {
      setSendingReset(false);
    }
  };

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Manage the details your teammates see and review your account security."
        actions={
          isAdmin ? (
            <Link
              href="/team"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 text-[12px] font-semibold text-ink transition hover:bg-surface-2"
            >
              <Users className="size-3.5" /> Team directory
            </Link>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="surface-card">
            <div className="flex items-center gap-2 border-b border-line px-5 py-4">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                <UserRound className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-ink">Profile details</h2>
                <p className="text-[11px] text-muted">
                  Saved with PATCH /update/:id
                </p>
              </div>
            </div>

            <form onSubmit={save} className="space-y-4 px-5 py-5" noValidate>
              {error ? (
                <Alert variant="error" title="Could not save">
                  {error}
                </Alert>
              ) : null}

              <div className="flex items-center gap-4 rounded-xl border border-line bg-surface-2/60 p-3.5">
                <Avatar name={username || user.username} src={profilePic || user.profilePic} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{username || user.username}</p>
                  <p className="truncate text-[11px] text-muted">{user.email}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge className={roleMeta.className}>{roleMeta.label}</Badge>
                    <Badge
                      className={
                        user.status
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20"
                          : "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20"
                      }
                    >
                      {user.status ? "Active" : "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" htmlFor="profile-username" required>
                  <TextInput
                    id="profile-username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    leadingIcon={<UserRound className="size-4" />}
                    disabled={saving}
                  />
                </Field>

                <Field
                  label="Email address"
                  htmlFor="profile-email"
                  hint="Email changes require re-verification, so they are locked here."
                >
                  <TextInput
                    id="profile-email"
                    value={user.email}
                    leadingIcon={<Mail className="size-4" />}
                    disabled
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Gender" htmlFor="profile-gender">
                  <Select
                    id="profile-gender"
                    value={gender}
                    onChange={(event) => setGender(event.target.value as Gender | "")}
                    disabled={saving}
                  >
                    <option value="">Not specified</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="others">Other</option>
                  </Select>
                </Field>

                <Field label="Address" htmlFor="profile-address" hint="Optional">
                  <TextInput
                    id="profile-address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="City, country"
                    leadingIcon={<MapPin className="size-4" />}
                    disabled={saving}
                  />
                </Field>
              </div>

              <Field
                label="Profile picture URL"
                htmlFor="profile-pic"
                hint="Optional — use a public image URL."
              >
                <TextInput
                  id="profile-pic"
                  value={profilePic}
                  onChange={(event) => setProfilePic(event.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  disabled={saving}
                />
              </Field>

              <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
                <p className="text-[11px] text-muted">
                  {dirty ? "You have unsaved changes." : "Everything is up to date."}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!dirty || saving}
                    onClick={() => {
                      setUsername(user.username ?? "");
                      setAddress(user.address ?? "");
                      setGender(user.gender ?? "");
                      setProfilePic(user.profilePic ?? "");
                      setError(null);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    loading={saving}
                    disabled={!dirty}
                    leadingIcon={<Save className="size-3.5" />}
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            </form>
          </section>

          <section className="surface-card">
            <div className="flex items-center gap-2 border-b border-line px-5 py-4">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                <ShieldCheck className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-ink">Security</h2>
                <p className="text-[11px] text-muted">Session and password controls</p>
              </div>
            </div>
            <div className="space-y-3 px-5 py-5">
              <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface-2/60 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  <div>
                    <p className="text-xs font-semibold text-ink">Email verified</p>
                    <p className="text-[11px] text-muted">
                      {user.email} is verified and can sign in.
                    </p>
                  </div>
                </div>
                <Badge className="self-start bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20">
                  Verified
                </Badge>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface-2/60 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5">
                  <KeyRound className="mt-0.5 size-4 shrink-0 text-accent" />
                  <div>
                    <p className="text-xs font-semibold text-ink">Password</p>
                    <p className="text-[11px] text-muted">
                      Request a single-use reset link from the API.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={sendReset}
                  loading={sendingReset}
                  className="self-start"
                >
                  Send reset link
                </Button>
              </div>

              <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface-2/60 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2.5">
                  <LogOut className="mt-0.5 size-4 shrink-0 text-rose-500" />
                  <div>
                    <p className="text-xs font-semibold text-ink">Active session</p>
                    <p className="text-[11px] text-muted">
                      Signing out revokes the refresh token on the backend.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  loading={signingOut}
                  className="self-start text-rose-600 hover:text-rose-700 dark:text-rose-400"
                >
                  Sign out
                </Button>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="surface-card">
            <div className="border-b border-line px-5 py-4">
              <h2 className="text-sm font-semibold text-ink">Account</h2>
              <p className="text-[11px] text-muted">Backend identity</p>
            </div>
            <dl className="divide-y divide-line px-5">
              <div className="flex items-center justify-between gap-3 py-3.5">
                <dt className="text-[11px] text-muted">Role</dt>
                <dd>
                  <Badge className={roleMeta.className}>{roleMeta.label}</Badge>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-3.5">
                <dt className="text-[11px] text-muted">Status</dt>
                <dd className="text-xs font-medium text-ink-soft">
                  {user.status ? "Active" : "Pending"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-3.5">
                <dt className="text-[11px] text-muted">Gender</dt>
                <dd className="text-xs font-medium text-ink-soft">
                  {user.gender ? GENDER_LABEL[user.gender] : "Not specified"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-3.5">
                <dt className="flex items-center gap-1.5 text-[11px] text-muted">
                  <CalendarDays className="size-3" /> Joined
                </dt>
                <dd className="text-xs font-medium text-ink-soft">
                  {formatDate(user.createdAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 py-3.5">
                <dt className="text-[11px] text-muted">Last update</dt>
                <dd className="text-xs font-medium text-ink-soft">
                  {formatDateTime(user.updatedAt)}
                </dd>
              </div>
              <div className="py-3.5">
                <dt className="text-[11px] text-muted">User ID</dt>
                <dd className="mt-1 break-all font-mono text-[10px] text-muted">
                  {user.id}
                </dd>
              </div>
            </dl>
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
                <ShieldCheck className="size-4" />
              </span>
              <p className="text-xs font-semibold text-ink">How sessions work</p>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Access tokens are short-lived signed JWTs. Refresh tokens are
              rotated by the API on every refresh and revoked when you sign out.
            </p>
            <Link
              href="/developers"
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-accent transition hover:text-accent-strong"
            >
              See the API surface
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
