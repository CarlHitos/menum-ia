type ChoiceChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
};

export function ChoiceChip({
  label,
  selected,
  onClick,
  className = "",
}: ChoiceChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full border px-4 py-3 text-center text-sm font-semibold transition ${
        selected
          ? "border-transparent bg-[var(--color-accent)] text-slate-950"
          : "border-[var(--color-border)] bg-[rgba(255,255,255,0.05)] text-[var(--color-paper)] hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
      } ${className}`}
    >
      {label}
    </button>
  );
}
