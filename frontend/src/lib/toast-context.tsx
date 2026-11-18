"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "./utils";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastApi {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { icon: React.ElementType; accent: string }> = {
  success: {
    icon: CheckCircle2,
    accent: "text-emerald-500",
  },
  error: {
    icon: AlertTriangle,
    accent: "text-rose-500",
  },
  info: {
    icon: Info,
    accent: "text-sky-500",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, title: string, description?: string) => {
      const id = ++counter.current;
      setToasts((current) => [...current.slice(-3), { id, title, description, variant }]);
      window.setTimeout(() => remove(id), 5000);
    },
    [remove],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, description) => push("success", title, description),
      error: (title, description) => push("error", title, description),
      info: (title, description) => push("info", title, description),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
      >
        {toasts.map((toast) => {
          const { icon: Icon, accent } = VARIANT_STYLES[toast.variant];
          return (
            <div
              key={toast.id}
              role="status"
              className="toast-enter pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line bg-surface p-4 shadow-lg shadow-black/5"
            >
              <Icon className={cn("mt-0.5 size-5 shrink-0", accent)} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => remove(toast.id)}
                className="rounded-md p-1 text-muted transition hover:bg-surface-2 hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}
