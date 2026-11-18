"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { BootScreen } from "@/components/layout/boot-screen";
import { useAuth } from "@/lib/auth-context";

export function AppGate({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      const next = pathname && pathname !== "/dashboard" ? pathname : "";
      router.replace(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
    }
  }, [ready, user, router, pathname]);

  if (!ready || !user) {
    return <BootScreen />;
  }

  return <AppShell>{children}</AppShell>;
}
