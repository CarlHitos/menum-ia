import { ChoiceChip } from "@/components/ui/choice-chip";
import { InputCard } from "@/components/ui/input-card";
import { SectionCard } from "@/components/ui/section-card";
import type {
  OnboardingDraft,
  OnboardingMemberDraft,
} from "@/features/onboarding/types";
import { goalOptions } from "@/lib/domain/goal-labels";

type MembersStepProps = {
  draft: OnboardingDraft;
  currentMemberIndex: number;
  onMemberChange: (
    memberId: string,
    updates: Partial<OnboardingMemberDraft>,
  ) => void;
};

const allergySuggestions = ["Sin gluten", "Sin lactosa", "Frutos secos"];
const restrictionSuggestions = ["Vegetariano", "Vegano", "Sin cerdo"];

export function MembersStep({
  draft,
  currentMemberIndex,
  onMemberChange,
}: MembersStepProps) {
  const member = draft.members[currentMemberIndex];

  if (!member) {
    return null;
  }

  return (
    <div className="space-y-4">
      <SectionCard className="bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
          {currentMemberIndex === 0 ? "¿A quien anadimos primero?" : "¿A quien mas anadimos?"}
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--color-paper)]">
          {currentMemberIndex === 0
            ? "Personalicemos vuestra mesa"
            : `Casi terminamos · Miembro ${currentMemberIndex + 1} de ${draft.memberCount}`}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          MenumIA necesita conocer a cada miembro para que el plan, la compra y las recetas sean perfectas para todos.
        </p>
      </SectionCard>

      <SectionCard>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
          {member.name.trim()
            ? `Preferencias de ${member.name.trim()}`
            : `Miembro ${currentMemberIndex + 1} de ${draft.memberCount}`}
        </p>
        <div className="mt-3 space-y-3">
          <InputCard
            label="Nombre"
            value={member.name}
            onChange={(event) =>
              onMemberChange(member.id, { name: event.target.value })
            }
            placeholder="Ej: Carlos, Papa, Maria..."
          />

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Que objetivo tiene ahora mismo
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
            label="Alergias"
            value={member.allergies}
            onChange={(event) =>
              onMemberChange(member.id, { allergies: event.target.value })
            }
            placeholder="Ej: gluten, marisco, kiwi..."
          />
          <div className="-mt-2 flex flex-wrap gap-1.5">
            {allergySuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() =>
                  onMemberChange(member.id, {
                    allergies: appendSuggestion(member.allergies, suggestion),
                  })
                }
                className="rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.05)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--color-muted)] transition hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] hover:text-[var(--color-paper)] active:bg-[var(--color-accent)] active:text-slate-950"
              >
                + {suggestion}
              </button>
            ))}
          </div>

          <InputCard
            label="Restricciones"
            value={member.restrictions}
            onChange={(event) =>
              onMemberChange(member.id, { restrictions: event.target.value })
            }
            placeholder="Ej: vegetariano, sin cerdo..."
          />
          <div className="-mt-2 flex flex-wrap gap-1.5">
            {restrictionSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() =>
                  onMemberChange(member.id, {
                    restrictions: appendSuggestion(member.restrictions, suggestion),
                  })
                }
                className="rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.05)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--color-muted)] transition hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] hover:text-[var(--color-paper)] active:bg-[var(--color-accent)] active:text-slate-950"
              >
                + {suggestion}
              </button>
            ))}
          </div>

          <InputCard
            label="Lo que no le gusta"
            value={member.dislikes}
            onChange={(event) =>
              onMemberChange(member.id, { dislikes: event.target.value })
            }
            placeholder="Ej: brocoli, coliflor, higado..."
            hint="Dinos qué alimentos odiáis y MenumIA nunca los incluirá en vuestras recetas."
          />
        </div>
      </SectionCard>
    </div>
  );
}

function appendSuggestion(currentValue: string, suggestion: string) {
  const values = currentValue
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (values.some((entry) => entry.toLowerCase() === suggestion.toLowerCase())) {
    return currentValue;
  }

  return values.length > 0 ? `${values.join(", ")}, ${suggestion}` : suggestion;
}
