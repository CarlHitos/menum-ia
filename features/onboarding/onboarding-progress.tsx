type OnboardingProgressProps = {
  currentStep: number;
  totalSteps: number;
  labels: string[];
};

export function OnboardingProgress({
  currentStep,
  totalSteps,
  labels,
}: OnboardingProgressProps) {
  return (
    <div className="mb-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
          Paso {currentStep + 1} de {totalSteps}
        </p>
        <p className="text-xs text-[var(--color-muted)]">{labels[currentStep]}</p>
      </div>
      <div className="flex gap-2">
        {labels.map((label, index) => (
          <div key={label} className="flex-1">
            <div
              className={`h-2 rounded-full ${
                index <= currentStep
                  ? "bg-[var(--color-accent)]"
                  : "bg-[rgba(255,255,255,0.08)]"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
