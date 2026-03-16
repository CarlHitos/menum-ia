import { ChoiceChip } from "@/components/ui/choice-chip";
import { InputCard } from "@/components/ui/input-card";
import { SectionCard } from "@/components/ui/section-card";
import type { OnboardingDraft } from "@/features/onboarding/types";
import type { MealType } from "@/lib/domain/types";

type PreferencesStepProps = {
  draft: OnboardingDraft;
  onChange: (updates: Partial<OnboardingDraft>) => void;
};

const cookingOptions = [
  { value: "low", label: "Express (<15 min)" },
  { value: "medium", label: "Estandar (30 min)" },
  { value: "high", label: "Me gusta cocinar" },
] as const;

const repeatOptions = [
  { value: "repeat-base-week", label: "Ahorro maximo" },
  { value: "vary-week", label: "Variedad total" },
] as const;

const mealOptions: Array<{ value: MealType; label: string }> = [
  { value: "breakfast", label: "Desayuno" },
  { value: "lunch", label: "Comida" },
  { value: "snack", label: "Snack / merienda" },
  { value: "dinner", label: "Cena" },
];

export function PreferencesStep({
  draft,
  onChange,
}: PreferencesStepProps) {
  function toggleMealType(mealType: MealType) {
    const exists = draft.mealsPerDay.includes(mealType);
    const nextMeals = exists
      ? draft.mealsPerDay.filter((entry) => entry !== mealType)
      : [...draft.mealsPerDay, mealType];

    if (nextMeals.length === 0) {
      return;
    }

    onChange({ mealsPerDay: nextMeals });
  }

  return (
    <div className="space-y-4">
      <SectionCard className="bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
          Disenemos vuestra semana
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--color-paper)]">
          Ajustemos los detalles finales
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          Ajusta estos detalles para que MenumIA cree un plan que cuide vuestro bolsillo y vuestro tiempo.
        </p>
      </SectionCard>

      <SectionCard>
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          ¿Que comidas quereis organizar?
        </p>
        <div className="flex flex-wrap gap-2">
          {mealOptions.map((option) => (
            <ChoiceChip
              key={option.value}
              label={option.label}
              selected={draft.mealsPerDay.includes(option.value)}
              onClick={() => toggleMealType(option.value)}
            />
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          Marcad solo las que haceis en casa para que la lista de la compra sea exacta.
        </p>
      </SectionCard>

      <SectionCard>
        <InputCard
          label="Vuestro presupuesto objetivo"
          value={draft.weeklyBudget}
          onChange={(event) => onChange({ weeklyBudget: event.target.value })}
          placeholder="Ej: 135€"
          hint="Intentaremos que vuestra lista de la compra no supere esta cifra."
        />
      </SectionCard>

      <SectionCard>
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          ¿De cuanto tiempo disponeis?
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
        label="Vuestra tienda de confianza"
        value={draft.preferredStore}
        onChange={(event) => onChange({ preferredStore: event.target.value })}
        placeholder="Ej: Mercadona, Lidl, Carrefour..."
      />

      <SectionCard>
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          ¿Como preferis vuestro menu?
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
        <div className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
          <p>
            <span className="font-semibold text-[var(--color-paper)]">Ahorro maximo:</span>{" "}
            usar ingredientes similares para gastar menos.
          </p>
          <p>
            <span className="font-semibold text-[var(--color-paper)]">Variedad total:</span>{" "}
            platos distintos cada dia.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
