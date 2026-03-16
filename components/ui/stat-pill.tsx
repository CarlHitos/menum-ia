type StatPillProps = {
  label: string;
  value: string;
};

export function StatPill({ label, value }: StatPillProps) {
  const isHousehold = label.toLowerCase() === "hogar";

  return (
    <div className="flex min-h-16 flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.08)] px-3 py-2 text-center">
      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {label}
      </p>
      <p
        className={`mt-0.5 font-semibold leading-tight text-[var(--color-paper)] ${
          isHousehold ? "text-base" : "text-sm"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
