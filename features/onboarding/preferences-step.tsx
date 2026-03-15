import { ChoiceChip } from "@/components/ui/choice-chip";
import { InputCard } from "@/components/ui/input-card";
import { SectionCard } from "@/components/ui/section-card";
import type { OnboardingDraft } from "@/features/onboarding/types";

type PreferencesStepProps = {
  draft: OnboardingDraft;
  onChange: (updates: Partial<OnboardingDraft>) => void;
};

const cookingOptions = [
  { value: "low", label: "Muy poco tiempo" },
  { value: "medium", label: "30 min aprox." },
  { value: "high", label: "Puedo cocinar mas" },
] as const;

const repeatOptions = [
  { value: "repeat-base-week", label: "Repetir base" },
  { value: "vary-week", label: "Variar semana" },
] as const;

export function PreferencesStep({
  draft,
  onChange,
}: PreferencesStepProps) {
  return (
    <div className="space-y-4">
      <SectionCard>
        <InputCard
          label="Presupuesto semanal aproximado"
          value={draft.weeklyBudget}
          onChange={(event) => onChange({ weeklyBudget: event.target.value })}
          placeholder="Ej. 120-150 EUR"
        />
      </SectionCard>

      <SectionCard>
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Tiempo disponible para cocinar
        </p>
        <div className="flex flex-wrap gap-2">
          {cookingOptions.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={draft.cookingLoad === option.value}
              onClick={() => onChange({ cookingLoad: option.value })}
            />
          ))}
        </div>
      </SectionCard>

      <InputCard
        label="Supermercado habitual"
        value={draft.preferredStore}
        onChange={(event) => onChange({ preferredStore: event.target.value })}
        placeholder="Ej. Mercadona"
      />

      <SectionCard>
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Preferencia semanal
        </p>
        <div className="flex flex-wrap gap-2">
          {repeatOptions.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={draft.repeatMode === option.value}
              onClick={() => onChange({ repeatMode: option.value })}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
