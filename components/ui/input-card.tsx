import { useId, type InputHTMLAttributes } from "react";

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
  "aria-describedby": describedBy,
  ...props
}: InputCardProps) {
  const messageId = useId();
  const hasMessage = Boolean(error || hint);
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
        aria-describedby={[describedBy, hasMessage ? messageId : undefined].filter(Boolean).join(" ") || undefined}
        className={`mt-2 min-h-12 w-full cursor-text rounded-xl border bg-[rgba(7,16,32,0.28)] px-3 py-3 text-base text-[var(--color-paper)] outline-none transition placeholder:text-[var(--color-muted)] placeholder:opacity-60 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-red-400/70 focus:border-red-300 focus:ring-red-400/25" : "border-[var(--color-border)] focus:border-[var(--color-accent)] focus:ring-[rgba(252,163,17,0.2)]"} ${className}`}
      />
      {error ? (
        <span id={messageId} className="mt-2 block text-xs text-red-200">{error}</span>
      ) : hint ? (
        <span id={messageId} className="mt-2 block text-xs text-[var(--color-muted)]">{hint}</span>
      ) : null}
    </label>
  );
}
