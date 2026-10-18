import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  compact = false,
}: PageHeaderProps) {
  return (
    <header className={`${compact ? "mb-2" : "mb-6"} flex items-start justify-between gap-4`}>
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-accent-soft)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-paper)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--color-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
