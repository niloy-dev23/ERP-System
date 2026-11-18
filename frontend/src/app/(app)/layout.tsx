import { Suspense } from "react";
import { AppGate } from "@/components/layout/app-gate";
import { BootScreen } from "@/components/layout/boot-screen";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<BootScreen />}>
      <AppGate>{children}</AppGate>
    </Suspense>
  );
}
