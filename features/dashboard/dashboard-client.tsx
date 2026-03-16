"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { SectionCard } from "@/components/ui/section-card";
import { StatPill } from "@/components/ui/stat-pill";
import { WeeklyMenu } from "@/features/week-menu/weekly-menu";
import type { OnboardingDraft } from "@/features/onboarding/types";
import type {
  Household,
  MealSlot,
  PlanningStartMode,
  Recipe,
  WeeklyPlan,
} from "@/lib/domain/types";
import {
  buildWeeklyPlanPreview,
  formatMealTypeLabel,
} from "@/lib/domain/weekly-plan-preview";
import {
  buildActivePlanFromTemplate,
  getPlanRangeLabel,
  updateWeeklyPlanStatus,
} from "@/lib/domain/weekly-plan-runtime";
import { loadOnboardingDraft } from "@/lib/local-storage/onboarding-storage";
import { buildDashboardContext } from "@/lib/local-storage/onboarding-mappers";
import {
  loadActiveWeeklyPlan,
  saveActiveWeeklyPlan,
} from "@/lib/local-storage/weekly-plan-storage";
import { recipes, weekTemplate } from "@/lib/mocks";

type DashboardClientProps = {
  household: Household;
};

export function DashboardClient({ household }: DashboardClientProps) {
  const router = useRouter();
  const storedDraft: OnboardingDraft | null = loadOnboardingDraft();
  const [plan, setPlan] = useState<WeeklyPlan | null>(() => loadActiveWeeklyPlan());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const context = buildDashboardContext(storedDraft, household);
  const visibleMeals =
    context.mealsPerDay.length > 0
      ? context.mealsPerDay
      : household.planningPreferences.mealsPerDay;
  const weeklyPlanPreview = plan
    ? buildWeeklyPlanPreview(plan, recipes, visibleMeals)
    : [];
  const visibleMealsLabel = visibleMeals.map(formatMealTypeLabel).join(", ");
  const rangeLabel = plan ? getPlanRangeLabel(plan) : "";
  const memberCount =
    context.memberNames.length || storedDraft?.memberCount || household.members.length;
  const hasChangesAfterConfirmation =
    plan?.status === "draft" && Boolean(plan.confirmedAt);
  const selectedSlot = findSlotById(plan, selectedSlotId);
  const availableRecipes = useMemo(
    () =>
      selectedSlot
        ? recipes.filter((recipe) => recipe.category === selectedSlot.mealType)
        : [],
    [selectedSlot],
  );
  const selectedRecipe = selectedSlot
    ? recipes.find((recipe) => recipe.id === selectedSlot.recipeId) ?? null
    : null;

  useEffect(() => {
    if (!plan) {
      return;
    }

    saveActiveWeeklyPlan(plan);
  }, [plan]);

  useEffect(() => {
    if (!selectedSlotId || !editorRef.current) {
      return;
    }

    editorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedSlotId]);

  function handleSelectSlot(slotId: string) {
    setSelectedSlotId(slotId);
  }

  function replaceSlotRecipe(slotId: string, nextRecipe: Recipe) {
    setPlan((current) => {
      if (!current) {
        return current;
      }

      const currentSlot = findSlotById(current, slotId);

      if (!currentSlot || currentSlot.recipeId === nextRecipe.id) {
        return current;
      }

      return {
        ...current,
        status: current.status === "confirmed" ? "draft" : current.status,
        updatedAt: new Date().toISOString(),
        days: current.days.map((day) => ({
          ...day,
          slots: day.slots.map((slot) =>
            slot.id === slotId ? { ...slot, recipeId: nextRecipe.id } : slot,
          ),
        })),
      };
    });
    setSelectedSlotId(null);
  }

  function handleGoToShoppingList() {
    router.push("/shopping-list");
  }

  function handleConfirmWeek() {
    if (!plan) {
      return;
    }

    const confirmedPlan = updateWeeklyPlanStatus(plan, "confirmed");
    setPlan(confirmedPlan);
    saveActiveWeeklyPlan(confirmedPlan);
  }

  function handleStartPlanning(mode: PlanningStartMode) {
    const nextPlan = buildActivePlanFromTemplate(weekTemplate, {
      householdId: household.id,
      planningStartMode: mode,
    });
    setPlan(nextPlan);
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatPill label="Hogar" value={context.householdName} />
        <StatPill label="Comidas" value={visibleMealsLabel} />
      </div>

      {!plan ? (
        <SectionCard className="mb-4 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
            Inicio de planificacion
          </p>
          <h2 className="mt-2 text-lg font-semibold text-[var(--color-paper)]">
            ¿Cuándo queréis empezar?
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            Elige si quieres arrancar con la semana desde hoy o preparar la siguiente desde el proximo lunes.
          </p>
          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={() => handleStartPlanning("today")}
              className="rounded-2xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.05)] px-4 py-4 text-left transition hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
            >
              <p className="text-sm font-semibold text-[var(--color-paper)]">
                Empezar hoy
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                Materializa una semana activa de 7 dias rodantes desde hoy.
              </p>
            </button>
            <button
              type="button"
              onClick={() => handleStartPlanning("next-monday")}
              className="rounded-2xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.05)] px-4 py-4 text-left transition hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
            >
              <p className="text-sm font-semibold text-[var(--color-paper)]">
                Empezar el proximo lunes
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                Prepara la semana completa con estructura de lunes a domingo.
              </p>
            </button>
          </div>
        </SectionCard>
      ) : null}

      {plan ? (
        <>

      <SectionCard className="mb-4 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
                {plan.status === "confirmed"
                  ? "Semana activa"
                  : hasChangesAfterConfirmation
                    ? "Cambios sobre semana activa"
                    : "Semana en edicion"}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  plan.status === "confirmed"
                    ? "bg-[rgba(135,214,141,0.18)] text-[var(--color-success)]"
                    : "bg-[rgba(252,163,17,0.16)] text-[var(--color-accent-soft)]"
                }`}
              >
                {plan.status === "confirmed" ? "Confirmada" : "Draft"}
              </span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-[var(--color-paper)]">
              {rangeLabel}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              {plan.status === "confirmed"
                ? "Esta es vuestra semana activa para comprar y cocinar."
                : hasChangesAfterConfirmation
                  ? "Has cambiado recetas de una semana ya cerrada. Si sigues, la compra usara esta version actual."
                  : "Ajusta recetas antes de cerrar la semana y pasar a compra."}
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
              {plan.status === "confirmed"
                ? "La compra usara esta semana activa"
                : "La compra se generara con esta version"}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            {plan.status === "confirmed" ? (
              <button
                type="button"
                onClick={handleGoToShoppingList}
                className="rounded-full border border-[rgba(252,163,17,0.26)] bg-[rgba(252,163,17,0.08)] px-3 py-2 text-sm font-semibold text-[var(--color-paper)] transition hover:border-[rgba(252,163,17,0.5)] hover:bg-[rgba(252,163,17,0.18)] active:bg-[var(--color-accent)] active:text-slate-950"
              >
                Hacer la compra
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmWeek}
                className="rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-slate-950"
              >
                Confirmar semana
              </button>
            )}

            {plan.status === "draft" ? (
              <button
                type="button"
                onClick={handleGoToShoppingList}
                className="text-xs font-semibold text-[var(--color-muted)] transition hover:text-[var(--color-paper)]"
              >
                Ver compra provisional
              </button>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Resumen del hogar
        </p>
        <h2 className="mt-2 text-lg font-semibold text-[var(--color-paper)]">
          Menu optimizado para {memberCount} personas en {context.preferredStore}. Objetivo:{" "}
          {formatBudget(storedDraft?.weeklyBudget)}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {context.memberNames.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-2 text-sm text-[var(--color-paper)]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(252,163,17,0.16)] text-xs font-semibold text-[var(--color-accent)]">
                {getInitials(name)}
              </span>
              {name}
            </span>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
          <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-2">
            {context.cookingLoadLabel}
          </span>
          <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-2">
            {context.repeatLabel}
          </span>
          <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-2">
            {context.goalSummary}
          </span>
        </div>
      </SectionCard>

      <WeeklyMenu
        plan={weeklyPlanPreview}
        initialDayKey={plan.days[0]?.dayKey ?? null}
        selectedSlotId={selectedSlotId}
        onSelectSlot={handleSelectSlot}
      />

      {selectedSlot ? (
        <div ref={editorRef}>
          <SectionCard className="mt-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
            Editar bloque
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--color-paper)]">
            {formatMealTypeLabel(selectedSlot.mealType)}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            {selectedRecipe
              ? `Ahora mismo esta usando ${selectedRecipe.title}. Toca otra receta para sustituirla.`
              : "Selecciona una receta para este bloque."}
          </p>

          <div className="mt-4 grid gap-3">
            {availableRecipes.map((recipe) => {
              const active = selectedSlot.recipeId === recipe.id;

              return (
                <button
                  key={recipe.id}
                  type="button"
                  onClick={() => replaceSlotRecipe(selectedSlot.id, recipe)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    active
                      ? "border-[rgba(252,163,17,0.55)] bg-[rgba(252,163,17,0.12)]"
                      : "border-[var(--color-border)] bg-[rgba(255,255,255,0.05)]"
                  }`}
                  disabled={active}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-paper)]">
                        {recipe.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                        {recipe.description}
                      </p>
                    </div>
                    <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      {recipe.durationMinutes} min
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                      {recipe.baseServings} personas
                    </span>
                    <span
                      className={`text-xs font-semibold uppercase tracking-[0.16em] ${
                        active
                          ? "text-[var(--color-accent)]"
                          : "text-[var(--color-accent-soft)]"
                      }`}
                    >
                      {active ? "Receta actual" : "Usar esta receta"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          </SectionCard>
        </div>
      ) : null}
        </>
      ) : null}
    </>
  );
}

function formatBudget(value?: string) {
  if (!value?.trim()) {
    return "sin definir";
  }

  return value.includes("€") ? value : value.replace("EUR", "€").trim();
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function findSlotById(plan: WeeklyPlan | null, slotId: string | null): MealSlot | null {
  if (!plan || !slotId) {
    return null;
  }

  return plan.days.flatMap((day) => day.slots).find((slot) => slot.id === slotId) ?? null;
}
