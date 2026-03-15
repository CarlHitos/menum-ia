import type { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";

type AppShellProps = {
  children: ReactNode;
  currentPath: string;
};

export function AppShell({ children, currentPath }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(252,163,17,0.24),transparent_22%),radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_18%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-6 sm:px-6">
        <div className="rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-[var(--shadow-card)] backdrop-blur-xl sm:p-5">
          {children}
        </div>
        <BottomNav currentPath={currentPath} />
      </div>
    </div>
  );
}
