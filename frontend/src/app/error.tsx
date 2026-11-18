"use client";

import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 text-center shadow-xl">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400">
          <AlertTriangle className="size-6" />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-ink">Something went wrong</h1>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          {error.message || "An unexpected client error interrupted this page."}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Button size="sm" onClick={reset}>
            Try again
          </Button>
          <Button size="sm" variant="outline" onClick={() => router.push("/")}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
