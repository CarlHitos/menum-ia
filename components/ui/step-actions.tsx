type StepActionsProps = {
  canGoBack: boolean;
  onBack: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
};

export function StepActions({
  canGoBack,
  onBack,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
}: StepActionsProps) {
  return (
    <div className="mt-4 flex gap-3">
      {canGoBack ? (
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-paper)]"
        >
          Volver
        </button>
      ) : null}
      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        className="flex-1 rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-slate-950 disabled:opacity-50"
      >
        {primaryLabel}
      </button>
    </div>
  );
}
