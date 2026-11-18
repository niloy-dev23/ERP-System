import type { Metadata } from "next";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/primitives";
import { TeamDirectory } from "@/components/team/team-directory";

export const metadata: Metadata = {
  title: "Team",
  description: "Browse the workspace directory and manage member access.",
};

export default function TeamPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-14 rounded-2xl" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-44 rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <TeamDirectory />
    </Suspense>
  );
}
