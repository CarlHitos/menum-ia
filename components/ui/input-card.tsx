import type { InputHTMLAttributes } from "react";

type InputCardProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
};

export function InputCard({
  label,
  hint,
  error,
  className = "",
  ...props
}: InputCardProps) {
  return (
    <label
      className={`block rounded-[1.5rem] border bg-[rgba(255,255,255,0.05)] px-4 py-3 transition focus-within:bg-[rgba(255,255,255,0.07)] ${
        error
          ? "border-red-400/70 focus-within:border-red-300"
          : "border-[var(--color-border)] focus-within:border-[rgba(252,163,17,0.55)]"
      }`}
    >
      <span className="block text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {label}
      </span>
      <input
        {...props}
        aria-invalid={Boolean(error)}
        className={`mt-2 w-full bg-transparent text-base text-[var(--color-paper)] outline-none placeholder:text-[var(--color-muted)] ${className}`}
      />
      {error ? (
        <span className="mt-2 block text-xs text-red-200">{error}</span>
      ) : hint ? (
        <span className="mt-2 block text-xs text-[var(--color-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}
