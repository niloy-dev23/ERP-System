"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, setUnauthorizedHandler, tokenStore } from "./api";
import type { LoginInput, SafeUser, UserRecord } from "./types";

interface AuthContextValue {
  user: UserRecord | null;
  ready: boolean;
  isAdmin: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateLocalUser: (patch: Partial<UserRecord>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function withSafeUser(user: SafeUser): UserRecord {
  return {
    ...user,
    role: user.role ?? "user",
    status: user.status ?? true,
  };
}

async function hydrateFullProfile(minimal: SafeUser): Promise<UserRecord> {
  const base = withSafeUser(minimal);

  // Login and /me now return role/status directly. Only fall back to the
  // single-user endpoint when those fields are missing (e.g. older API).
  if (minimal.role != null && typeof minimal.status === "boolean") {
    return base;
  }

  try {
    const full = await api.getUser(base.id);
    return withSafeUser({ ...base, ...full });
  } catch {
    return base;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserRecord | null>(null);
  const [ready, setReady] = useState(false);
  const bootstrapped = useRef(false);

  const persist = useCallback((next: UserRecord | null) => {
    setUser(next);
    tokenStore.cacheUser(next);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
      tokenStore.cacheUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    let cancelled = false;
    const cached = tokenStore.cachedUser();

    if (!tokenStore.hasSession()) {
      setReady(true);
      return;
    }

    if (cached) setUser(cached);

    (async () => {
      try {
        const me = await api.me();
        const profile = await hydrateFullProfile(me);
        if (!cancelled) persist(profile);
      } catch (error) {
        if (!cancelled) {
          const status = error instanceof ApiError ? error.status : 0;
          if (status === 401 || status === 403) {
            tokenStore.clear();
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [persist]);

  // Keep multiple tabs in sync when one of them logs out.
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      tokenStore.cacheUser(null);
    };
    window.addEventListener("taskflow:unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("taskflow:unauthorized", onUnauthorized);
  }, []);

  const login = useCallback(
    async (input: LoginInput) => {
      const payload = await api.login(input);
      tokenStore.set({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
      });
      const profile = await hydrateFullProfile(payload.user);
      persist(profile);
      setReady(true);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      tokenStore.clear();
    }
    setUser(null);
    tokenStore.cacheUser(null);
    router.replace("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (!tokenStore.hasSession()) return;
    const me = await api.me();
    const profile = await hydrateFullProfile(me);
    persist(profile);
  }, [persist]);

  const updateLocalUser = useCallback(
    (patch: Partial<UserRecord>) => {
      setUser((current) => {
        if (!current) return current;
        const next = { ...current, ...patch };
        tokenStore.cacheUser(next);
        return next;
      });
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      isAdmin: user?.role?.toLowerCase() === "admin",
      login,
      logout,
      refreshUser,
      updateLocalUser,
    }),
    [user, ready, login, logout, refreshUser, updateLocalUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
