type StatPillProps = {
  label: string;
  value: string;
  suffix?: string;
};

export function StatPill({ label, value, suffix }: StatPillProps) {
  return (
    <div className="flex h-full min-h-20 min-w-0 flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.08)] px-3 py-2 text-center">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">{label}</p>
      <p className={`mt-1 w-full font-semibold leading-tight text-[var(--color-paper)] ${suffix ? "text-2xl" : "line-clamp-2 break-words text-base"}`}>
        {value}{suffix ? <span className="ml-1 text-sm font-normal text-[var(--color-muted)]">{suffix}</span> : null}
      </p>
    </div>
  );
}
