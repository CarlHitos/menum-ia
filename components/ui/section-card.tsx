import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SectionCard({ children, className = "" }: SectionCardProps) {
  return (
    <section
      className={`rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card-strong)] p-4 shadow-lg shadow-slate-950/10 ${className}`}
    >
      {children}
    </section>
  );
}
