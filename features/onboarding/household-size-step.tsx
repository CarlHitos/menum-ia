import { ChoiceChip } from "@/components/ui/choice-chip";
import { InputCard } from "@/components/ui/input-card";
import { SectionCard } from "@/components/ui/section-card";
import type { OnboardingDraft } from "@/features/onboarding/types";

type HouseholdSizeStepProps = {
  draft: OnboardingDraft;
  onChange: (updates: Partial<OnboardingDraft>) => void;
};

const memberOptions = [1, 2, 3, 4, 5];

export function HouseholdSizeStep({
  draft,
  onChange,
}: HouseholdSizeStepProps) {
  return (
    <div className="space-y-4">
      <SectionCard className="bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <p className="text-sm leading-6 text-[var(--color-paper)]">
          Define primero la estructura basica del hogar para adaptar el menu a una
          sola cocina compartida.
        </p>
      </SectionCard>

      <InputCard
        label="Nombre del hogar"
        value={draft.householdName}
        onChange={(event) => onChange({ householdName: event.target.value })}
        placeholder="Ej. Casa Rivera"
      />

      <SectionCard>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Cuantas personas cocinan y comen aqui
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
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
