import { Skeleton } from "@/components/ui/primitives";

export function FormSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-11 w-full" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-11 w-full" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}
