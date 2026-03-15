import type { InputHTMLAttributes } from "react";

type InputCardProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
};

export function InputCard({ label, hint, className = "", ...props }: InputCardProps) {
  return (
    <label className="block rounded-[1.5rem] border border-[var(--color-border)] bg-[rgba(255,255,255,0.05)] px-4 py-3">
      <span className="block text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {label}
      </span>
      <input
        {...props}
        className={`mt-2 w-full bg-transparent text-base text-[var(--color-paper)] outline-none placeholder:text-[var(--color-muted)] ${className}`}
      />
      {hint ? (
        <span className="mt-2 block text-xs text-[var(--color-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}
