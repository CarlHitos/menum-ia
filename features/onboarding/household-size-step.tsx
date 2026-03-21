import { ChoiceChip } from "@/components/ui/choice-chip";
import { InputCard } from "@/components/ui/input-card";
import { SectionCard } from "@/components/ui/section-card";
import type { OnboardingDraft } from "@/features/onboarding/types";

type HouseholdSizeStepProps = {
  draft: OnboardingDraft;
  onChange: (updates: Partial<OnboardingDraft>) => void;
  showNameError?: boolean;
};

const memberOptions = [1, 2, 3, 4, 5];

export function HouseholdSizeStep({
  draft,
  onChange,
  showNameError = false,
}: HouseholdSizeStepProps) {
  return (
    <div className="space-y-4">
      <SectionCard className="bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <p className="text-sm leading-6 text-[var(--color-paper)]">
          Para preparar bien tu planificacion, primero necesitamos saber como
          es el dia a dia en casa. Cuentanos quienes formaran parte de este hogar.
        </p>
      </SectionCard>

      <InputCard
        id="household-name"
        label="Nombre del hogar"
        value={draft.householdName}
        onChange={(event) => onChange({ householdName: event.target.value })}
        placeholder="Ej. Casa Rivera"
        hint="Pon un nombre para identificar este hogar y poder continuar."
        error={
          showNameError ? "Escribe un nombre para el hogar antes de continuar." : undefined
        }
      />

      <SectionCard>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Cuantas personas cocinan y comen aqui
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {memberOptions.map((count) => (
            <ChoiceChip
              key={count}
              label={`${count}`}
              selected={draft.memberCount === count}
              onClick={() => onChange({ memberCount: count })}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
