type StepActionsProps = {
  canGoBack: boolean;
  onBack: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryTone?: "solid" | "subtle";
};

export function StepActions({
  canGoBack,
  onBack,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  primaryTone = "solid",
}: StepActionsProps) {
  return (
    <div className="mt-4 flex gap-3">
      {canGoBack ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.05)] px-4 py-3 text-sm font-semibold text-[var(--color-paper)] transition hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
        >
          Volver
        </button>
      ) : null}
      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${
          primaryTone === "solid"
            ? "bg-[var(--color-accent)] text-slate-950"
            : "border border-[var(--color-border)] bg-[rgba(255,255,255,0.05)] text-[var(--color-paper)] hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
        }`}
      >
        {primaryLabel}
      </button>
    </div>
  );
}
