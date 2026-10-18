import Link from "next/link";

export function RecipeBackLink({ href, label, close = false }: {
  href: string;
  label: string;
  close?: boolean;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--color-border)] px-3 text-sm font-semibold text-[var(--color-paper)] transition hover:border-[var(--color-accent)] hover:bg-[rgba(252,163,17,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-[var(--color-paper)]">
        <path strokeLinecap="round" strokeLinejoin="round" d={close ? "m6 6 12 12M18 6 6 18" : "m12 5-7 7 7 7M5 12h14"} />
      </svg>
      <span className="text-[var(--color-paper)]">{label}</span>
    </Link>
  );
}
