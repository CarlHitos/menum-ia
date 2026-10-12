import { mealTypeLabels } from "@/lib/domain/meal-types";
import type { MealType } from "@/lib/domain/types";
import { SectionCard } from "@/components/ui/section-card";
import type { OnboardingDraft } from "@/features/onboarding/types";
import { formatGoalLabel } from "@/lib/domain/goal-labels";

type OnboardingReviewProps = {
  draft: OnboardingDraft;
  onComplete: () => void | Promise<void>;
  isSubmitting?: boolean;
  submitError?: string | null;
};

export function OnboardingReview({
  draft,
  onComplete,
  isSubmitting = false,
  submitError = null,
}: OnboardingReviewProps) {
  const householdName = draft.householdName || "tu hogar";

  return (
    <div className="space-y-4">
      <SectionCard className="bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
          Resumen final
        </p>
        <span className="mt-3 inline-flex rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-soft)]">
          Revisa los datos de tu hogar
        </span>
        <h2 className="mt-2 text-xl font-semibold text-[var(--color-paper)]">
          {`Todo listo, ${householdName}`}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          Guarda la configuración de tu hogar de {formatMemberCount(draft.memberCount)}.
          Después podrás elegir cuándo empezar y revisar las comidas antes de confirmar el menú.
        </p>
      </SectionCard>

      <SectionCard>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Miembros
        </p>
        <div className="mt-3 space-y-3">
          {draft.members.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl bg-[rgba(255,255,255,0.06)] px-4 py-3"
            >
              <p className="text-sm font-semibold text-[var(--color-paper)]">
                {member.name || "Sin nombre"}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {member.goal ? formatGoalLabel(member.goal) : "Objetivo pendiente"}
              </p>
              {member.allergies ? (
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Alergias: {member.allergies}
                </p>
              ) : null}
              {member.restrictions ? (
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  Restricciones: {member.restrictions}
                </p>
              ) : null}
              {member.dislikes ? (
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  No le gusta: {member.dislikes}
                </p>
              ) : null}
              {!member.allergies && !member.restrictions && !member.dislikes ? (
                <p className="mt-2 text-sm text-[var(--color-success)]">
                  Sin restricciones importantes
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Preferencias del hogar
        </p>
        <div className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
          <p>Comidas a planificar: {draft.mealsPerDay.map(formatMealType).join(", ")}</p>
          <p>Presupuesto semanal: Objetivo {formatBudget(draft.weeklyBudget)}</p>
          <p>Tiempo de cocina: {formatCookingLoad(draft.cookingLoad)}</p>
          <p>Supermercado habitual: {draft.preferredStore || "sin definir"}</p>
          <p>
            Planificacion:{" "}
            {draft.repeatMode === "repeat-base-week"
              ? "Ahorro maximo"
              : "Variedad y platos nuevos"}
          </p>
        </div>
      </SectionCard>

      {submitError ? (
        <SectionCard className="border-red-400/30 bg-red-500/10">
          <p className="text-sm leading-6 text-red-100">{submitError}</p>
        </SectionCard>
      ) : null}

      <button
        type="button"
        onClick={() => {
          void onComplete();
        }}
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-4 text-sm font-semibold text-slate-950"
      >
        {isSubmitting ? "Guardando hogar..." : "Preparar mi menú semanal"}
      </button>
    </div>
  );
}

function formatMemberCount(count: number) {
  return `${count} ${count === 1 ? "persona" : "personas"}`;
}

function formatMealType(mealType: MealType) {
  return mealTypeLabels[mealType].toLocaleLowerCase("es");
}

function formatBudget(value: string) {
  if (!value.trim()) {
    return "sin definir";
  }

  return value.includes("€") ? value : `${value}€`;
}

function formatCookingLoad(cookingLoad: OnboardingDraft["cookingLoad"]) {
  switch (cookingLoad) {
    case "low":
      return "Express y entre semana";
    case "medium":
      return "Ritmo equilibrado";
    case "high":
      return "Cocinando a tope";
    default:
      return cookingLoad;
  }
}
