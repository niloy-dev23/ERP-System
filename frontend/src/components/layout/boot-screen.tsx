import { Brand } from "@/components/brand";
import { Skeleton } from "@/components/ui/primitives";

export function BootScreen() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <header className="flex h-16 items-center border-b border-line px-5 sm:px-8">
        <Brand />
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:px-8">
        <div className="flex items-center gap-2 text-xs font-medium text-muted">
          <span className="size-4 animate-spin rounded-full border-2 border-line border-t-accent" />
          Preparing your workspace...
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="mt-6 h-72 rounded-2xl" />
      </div>
    </div>
  );
}
