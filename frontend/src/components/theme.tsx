"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "taskflow.theme";

export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");var d=window.matchMedia("(prefers-color-scheme: dark)").matches;if(t==="dark"||(!t&&d)){document.documentElement.classList.add("dark")}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_KEY);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const dark = stored === "dark" || (!stored && prefersDark);
      document.documentElement.classList.toggle("dark", dark);
    } catch {
      /* ignore */
    }
  }, []);

  return children;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className={`inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-muted transition hover:border-line-strong hover:text-ink ${className}`}
    >
      <Sun className="size-4 dark:hidden" aria-hidden />
      <Moon className="hidden size-4 dark:block" aria-hidden />
    </button>
  );
}
