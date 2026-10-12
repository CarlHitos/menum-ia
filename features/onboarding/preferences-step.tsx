import { mealTypeLabels, mealTypeOrder } from "@/lib/domain/meal-types";
import { ChoiceChip } from "@/components/ui/choice-chip";
import { InputCard } from "@/components/ui/input-card";
import { SectionCard } from "@/components/ui/section-card";
import type { OnboardingDraft } from "@/features/onboarding/types";
import type { MealType } from "@/lib/domain/types";

type PreferencesStepProps = {
  draft: OnboardingDraft;
  onChange: (updates: Partial<OnboardingDraft>) => void;
  showMealsError?: boolean;
  showCookingLoadError?: boolean;
  showRepeatModeError?: boolean;
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

const mealOptions = mealTypeOrder.map((value) => ({ value, label: mealTypeLabels[value] }));

export function PreferencesStep({
  draft,
  onChange,
  showMealsError = false,
  showCookingLoadError = false,
  showRepeatModeError = false,
}: PreferencesStepProps) {
  function toggleMealType(mealType: MealType) {
    const exists = draft.mealsPerDay.includes(mealType);
    const nextMeals = exists
      ? draft.mealsPerDay.filter((entry) => entry !== mealType)
      : [...draft.mealsPerDay, mealType];

    onChange({ mealsPerDay: nextMeals });
  }

  return (
    <div className="space-y-4">
      <SectionCard className="bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
          Disenemos tu semana
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--color-paper)]">
          Ajustemos los detalles finales
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          Ajusta estos detalles para que MenumIA cree un plan que cuide tu bolsillo y tu tiempo.
        </p>
      </SectionCard>

      <SectionCard
        className={
          showMealsError ? "border-red-400/70 bg-red-500/5" : undefined
        }
      >
        <div id="preferences-meals" tabIndex={-1}>
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          ¿Que comidas quieres organizar?
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
          Marca solo las que haces en casa para que la lista de la compra sea exacta.
        </p>
        {showMealsError ? (
          <p className="mt-2 text-xs text-red-200">
            Selecciona al menos una comida antes de continuar.
          </p>
        ) : null}
        </div>
      </SectionCard>

      <SectionCard>
        <InputCard
          label="Presupuesto objetivo"
          value={draft.weeklyBudget}
          onChange={(event) => onChange({ weeklyBudget: event.target.value })}
          placeholder="Ej: 135€"
          hint="Intentaremos que tu lista de la compra no supere esta cifra."
        />
      </SectionCard>

      <SectionCard
        className={
          showCookingLoadError ? "border-red-400/70 bg-red-500/5" : undefined
        }
      >
        <div id="preferences-cooking-load" tabIndex={-1}>
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          ¿De cuanto tiempo dispones?
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
        {showCookingLoadError ? (
          <p className="mt-2 text-xs text-red-200">
            Elige cuanto tiempo sueles tener para cocinar.
          </p>
        ) : null}
        </div>
      </SectionCard>

      <InputCard
        label="Tu tienda de confianza"
        value={draft.preferredStore}
        onChange={(event) => onChange({ preferredStore: event.target.value })}
        placeholder="Ej: Mercadona, Lidl, Carrefour..."
      />

      <SectionCard
        className={
          showRepeatModeError ? "border-red-400/70 bg-red-500/5" : undefined
        }
      >
        <div id="preferences-repeat-mode" tabIndex={-1}>
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          ¿Como prefieres tu menu?
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
        {showRepeatModeError ? (
          <p className="mt-2 text-xs text-red-200">
            Elige como prefieres organizar tu menu antes de continuar.
          </p>
        ) : null}
        </div>
      </SectionCard>
    </div>
  );
}
