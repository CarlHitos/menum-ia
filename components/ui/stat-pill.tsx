type StatPillProps = {
  label: string;
  value: string;
  suffix?: string;
};

export function StatPill({ label, value, suffix }: StatPillProps) {
  return (
    <div className="flex h-full min-h-16 min-w-0 flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.08)] px-2.5 py-1.5 text-center">
      <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--color-muted)]">{label}</p>
      <p className={`mt-0.5 w-full font-semibold leading-tight text-[var(--color-paper)] ${suffix ? "text-base" : "line-clamp-2 break-words text-sm"}`}>
        {value}{suffix ? <span className="ml-1 text-xs font-normal text-[var(--color-muted)]">{suffix}</span> : null}
      </p>
    </div>
  );
}
