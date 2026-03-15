type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
};

export function ChoiceChip({ label, selected, onClick }: ChoiceChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-3 text-sm font-semibold transition ${
        selected
          ? "border-transparent bg-[var(--color-accent)] text-slate-950"
          : "border-[var(--color-border)] bg-[rgba(255,255,255,0.05)] text-[var(--color-paper)]"
      }`}
    >
      {label}
    </button>
  );
}
