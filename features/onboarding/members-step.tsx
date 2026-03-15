import { ChoiceChip } from "@/components/ui/choice-chip";
import { InputCard } from "@/components/ui/input-card";
import { SectionCard } from "@/components/ui/section-card";
import type {
  OnboardingDraft,
  OnboardingMemberDraft,
} from "@/features/onboarding/types";

type MembersStepProps = {
  draft: OnboardingDraft;
  onMemberChange: (
    memberId: string,
    updates: Partial<OnboardingMemberDraft>,
  ) => void;
};

const goalOptions = [
  { value: "gain", label: "Ganar masa" },
  { value: "lose", label: "Perder grasa" },
  { value: "maintain", label: "Mantener" },
  { value: "eat-better", label: "Comer mejor" },
] as const;

export function MembersStep({ draft, onMemberChange }: MembersStepProps) {
  return (
    <div className="space-y-4">
      {draft.members.map((member, index) => (
        <SectionCard key={member.id}>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
            Persona {index + 1}
          </p>
          <div className="mt-3 space-y-3">
            <InputCard
              label="Nombre"
              value={member.name}
              onChange={(event) =>
                onMemberChange(member.id, { name: event.target.value })
              }
              placeholder="Nombre"
            />

            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Objetivo principal
              </p>
              <div className="flex flex-wrap gap-2">
                {goalOptions.map((goal) => (
                  <ChoiceChip
                    key={goal.value}
                    label={goal.label}
                    selected={member.goal === goal.value}
                    onClick={() => onMemberChange(member.id, { goal: goal.value })}
                  />
                ))}
              </div>
            </div>

            <InputCard
              label="Alergias o restricciones"
              value={member.restrictions}
              onChange={(event) =>
                onMemberChange(member.id, { restrictions: event.target.value })
              }
              placeholder="Ej. frutos secos, sin lactosa"
              hint="Separa ideas con comas si hace falta."
            />

            <InputCard
              label="Alimentos que no gustan"
              value={member.dislikes}
              onChange={(event) =>
                onMemberChange(member.id, { dislikes: event.target.value })
              }
              placeholder="Ej. pescado azul, brocoli"
            />
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
