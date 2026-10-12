"use client";

import { menuViewKey, rememberMenuPosition, takeMenuPosition } from "@/lib/ui/menu-navigation";
import { focusStepStart } from "@/lib/ui/step-navigation";
import { useRouter } from "next/navigation";
import { resolvePlanServings, updateSlotServings } from "@/lib/domain/plan-servings";
import { useEffect, useRef, useState } from "react";
import { RecipeBrowser } from "@/features/recipes/recipe-browser";
import { SectionCard } from "@/components/ui/section-card";
import { StatPill } from "@/components/ui/stat-pill";
import { WeeklyMenu } from "@/features/week-menu/weekly-menu";
import type {
  Household,
  MealSlot,
  PlanningStartMode,
  Recipe,
  WeekTemplate,
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
import { buildDashboardContext } from "@/lib/local-storage/onboarding-mappers";

type DashboardClientProps = {
  household: Household;
  weekTemplate: WeekTemplate;
  initialPlan: WeeklyPlan | null;
  recipes: Recipe[];
};

export function DashboardClient({
  household,
  weekTemplate,
  initialPlan,
  recipes,
}: DashboardClientProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<WeeklyPlan | null>(initialPlan);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const saveErrorRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const context = buildDashboardContext(null, household);
  const visibleMeals =
    context.mealsPerDay.length > 0
      ? context.mealsPerDay
      : household.planningPreferences.mealsPerDay;
  const weeklyPlanPreview = plan
    ? buildWeeklyPlanPreview(plan, recipes, visibleMeals)
    : [];
  const rangeLabel = plan ? getPlanRangeLabel(plan) : "";
  const hasChangesAfterConfirmation =
    plan?.status === "draft" && Boolean(plan.confirmedAt);
  const selectedSlot = findSlotById(plan, selectedSlotId);
  const selectedRecipe = selectedSlot
    ? recipes.find((recipe) => recipe.id === selectedSlot.recipeId) ?? null
    : null;

  useEffect(() => {
    if (!selectedSlotId || !editorRef.current) {
      return;
    }

    focusStepStart(editorRef.current);
  }, [selectedSlotId]);

  const returnPosition = useRef<{ key: string; position: number | null } | null>(null);
  const viewKey = plan ? menuViewKey(household.id, plan.id) : undefined;
  useEffect(() => {
    if (!viewKey) return;
    if (returnPosition.current?.key !== viewKey) {
      returnPosition.current = { key: viewKey, position: takeMenuPosition(viewKey) };
    }
    const position = returnPosition.current.position;
    if (position === null) return;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        window.scrollTo({ top: position, behavior: "instant" });
        if (returnPosition.current?.key === viewKey) returnPosition.current.position = null;
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [viewKey]);

  useEffect(() => {
    if (saveError && saveErrorRef.current) focusStepStart(saveErrorRef.current);
  }, [saveError]);

  function handleSelectSlot(slotId: string) {
    setSelectedSlotId(slotId);
  }

  function enqueueSave(action: () => Promise<void>) {
    setSaving(true);
    setSaveError(null);
    const pending = saveQueue.current.catch(() => {}).then(action);
    saveQueue.current = pending;
    void pending.then(() => {
      if (saveQueue.current === pending) setSaving(false);
    }, () => {
      if (saveQueue.current === pending) {
        setSaving(false);
        setSaveError("No se han podido guardar los cambios. Reintenta antes de continuar.");
      }
    });
  }

  function savePlan(next: WeeklyPlan) {
    setPlan(next);
    enqueueSave(() => persistWeeklyPlan(next));
  }

  function replaceSlotRecipe(slotId: string, nextRecipe: Recipe) {
    if (!plan) return;
    const currentSlot = findSlotById(plan, slotId);
    if (!currentSlot || currentSlot.recipeId === nextRecipe.id) return;
    savePlan({
      ...plan,
      status: "draft",
      updatedAt: new Date().toISOString(),
      days: plan.days.map((day) => ({
        ...day,
        slots: day.slots.map((slot) => slot.id === slotId ? { ...slot, recipeId: nextRecipe.id } : slot),
      })),
    });
    closeEditor(slotId);
  }

  function closeEditor(slotId: string) {
    setSelectedSlotId(null);
    window.requestAnimationFrame(() => {
      const meal = document.getElementById(`meal-${slotId}`);
      if (meal) focusStepStart(meal);
    });
  }

  async function navigateAfterSave(href: string) {
    try {
      let pending: Promise<void>;
      do {
        pending = saveQueue.current;
        await pending;
      } while (pending !== saveQueue.current);
      if (viewKey && href.startsWith("/recipes/")) rememberMenuPosition(viewKey);
      router.push(href);
    } catch {
      // Keep the current plan and display the retry action.
    }
  }

  function handleGoToShoppingList() {
    void navigateAfterSave("/shopping-list");
  }

  function handleConfirmWeek() {
    if (!plan || saving) return;
    savePlan(updateWeeklyPlanStatus(plan, "confirmed"));
    void navigateAfterSave("/shopping-list");
  }

  function handleStartPlanning(mode: PlanningStartMode) {
    const nextPlan = buildActivePlanFromTemplate(weekTemplate, {
      householdId: household.id,
      planningStartMode: mode,
    });
    savePlan(resolvePlanServings(nextPlan, household));
  }

  function handleResetPlanningStart() {
    if (!plan) return;
    const planId = plan.id;
    enqueueSave(async () => {
      await deleteWeeklyPlan(planId);
      setSelectedSlotId(null);
      setPlan(null);
    });
  }

  function changeServings(servings: number, override = true) {
    if (plan && selectedSlot) savePlan(updateSlotServings(plan, selectedSlot.id, servings, override));
  }

  return (
    <>
      {saving ? <p role="status" className="mb-3 text-sm text-[var(--color-muted)]">Guardando cambios…</p> : null}
      {saveError ? <div ref={saveErrorRef} tabIndex={-1} role="alert" className="mb-3 scroll-mt-6 rounded-2xl border border-[var(--color-accent)] p-3 text-sm">
        {saveError}
        {plan ? <button type="button" className="ml-2 underline" onClick={() => savePlan(plan)}>Reintentar</button> : null}
      </div> : null}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatPill label="Hogar" value={context.householdName} />
        <StatPill label="Comidas" value={String(new Set(visibleMeals).size)} suffix="/ día" />
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
                Prepara las comidas de los próximos siete días.
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
                Prepara las comidas de la próxima semana, de lunes a domingo.
              </p>
            </button>
          </div>
        </SectionCard>
      ) : null}

      {plan ? (
        <>

      <SectionCard className="mb-4">
        <p className="text-xs text-[var(--color-accent-soft)]">{rangeLabel}</p>
        <h2 className="mt-2 text-xl font-semibold">{plan.status === "confirmed" ? "Tu menú semanal" : "Revisa tu menú"}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          {plan.status === "confirmed" ? "Consulta las comidas de cada día. Puedes ver una receta o cambiarla cuando lo necesites." : "Recorre los días y cambia las comidas o los comensales si lo necesitas. Al terminar, confirma el menú debajo de las comidas para ver la compra."}
        </p>
      </SectionCard>

      <WeeklyMenu
        key={plan.id}
        viewKey={viewKey}
        headingLabel={plan.status === "confirmed" ? "Menú confirmado" : "Comidas del día"}
        onDayChange={() => setSelectedSlotId(null)}
        plan={weeklyPlanPreview}
        initialDayKey={plan.days[0]?.dayKey ?? null}
        selectedSlotId={selectedSlotId}
        onSelectSlot={handleSelectSlot}
        onOpenRecipe={(href) => void navigateAfterSave(href)}
      />

      {selectedSlot ? (
        <div ref={editorRef} tabIndex={-1} role="group" aria-label={`Cambiar ${formatMealTypeLabel(selectedSlot.mealType)}`} className="scroll-mt-6 outline-none">
          <SectionCard className="mt-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
            Cambiar comida
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--color-paper)]">
            {formatMealTypeLabel(selectedSlot.mealType)}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            {selectedRecipe
              ? `La receta actual es ${selectedRecipe.title}. Toca otra receta para sustituirla.`
              : "Selecciona una receta para este bloque."}
          </p>

          <div className="mt-4 rounded-2xl bg-[rgba(255,255,255,0.06)] p-4">
            <p className="text-sm font-semibold">Comensales para esta comida</p>
            <div className="mt-3 flex items-center gap-4">
              <button type="button" aria-label="Un comensal menos" disabled={selectedSlot.servings <= 1} onClick={() => changeServings(selectedSlot.servings - 1)} className="h-11 w-11 rounded-full border border-[var(--color-border)] disabled:opacity-30">−</button>
              <output aria-live="polite" className="text-xl font-semibold">{selectedSlot.servings}</output>
              <button type="button" aria-label="Un comensal más" onClick={() => changeServings(selectedSlot.servings + 1)} className="h-11 w-11 rounded-full border border-[var(--color-border)]">+</button>
            </div>
            <p className="mt-2 text-xs text-[var(--color-muted)]">Actualiza los ingredientes y la compra de esta comida.</p>
            {selectedSlot.servingsOverride ? <button type="button" onClick={() => changeServings(Math.max(1, household.members.length), false)} className="mt-3 min-h-11 text-sm underline">Usar tamaño del hogar ({household.members.length})</button> : null}
          </div>
          <button type="button" onClick={() => closeEditor(selectedSlot.id)} className="mt-3 min-h-11 text-sm underline">Volver al menú</button>
          <RecipeBrowser key={selectedSlot.id} recipes={recipes} mealType={selectedSlot.mealType} selectedId={selectedSlot.recipeId} onSelect={(recipe) => replaceSlotRecipe(selectedSlot.id, recipe)} />
          </SectionCard>
        </div>
      ) : null}
      <SectionCard className="mt-4 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
                {plan.status === "confirmed"
                  ? "Menú confirmado"
                  : hasChangesAfterConfirmation
                    ? "Has modificado tu menú"
                    : "¿Todo listo para la semana?"}
              </p>
              <span
                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  plan.status === "confirmed"
                    ? "bg-[rgba(135,214,141,0.18)] text-[var(--color-success)]"
                    : "bg-[rgba(252,163,17,0.16)] text-[var(--color-accent-soft)]"
                }`}
              >
                {plan.status === "confirmed" ? "Confirmada" : "Borrador"}
              </span>
            </div>
            <h2 className="mt-2 text-lg font-semibold text-[var(--color-paper)]">
              {rangeLabel}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              {plan.status === "confirmed"
                ? "Tu menú está guardado. Puedes consultar la compra o seguir ajustando las comidas."
                : hasChangesAfterConfirmation
                  ? "Revisa los cambios y vuelve a confirmar para continuar con la compra."
                  : "Si las comidas te encajan, confirma el menú y abre tu lista de compra."}
            </p>
            <p className="mt-2 text-xs italic text-[var(--color-muted)]/80">
              {plan.status === "confirmed"
                ? "La lista de compra se calcula con este menú."
                : "Puedes cambiar las comidas más adelante."}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {plan.status === "confirmed" ? (
              <button
                type="button"
                onClick={handleGoToShoppingList}
                className="inline-flex w-full items-center justify-center rounded-full border border-[rgba(252,163,17,0.26)] bg-[rgba(252,163,17,0.08)] px-3 py-2.5 text-sm font-semibold text-[var(--color-paper)] transition hover:border-[rgba(252,163,17,0.5)] hover:bg-[rgba(252,163,17,0.18)] active:bg-[var(--color-accent)] active:text-slate-950"
              >
                Ver lista de compra
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmWeek}
                disabled={saving}
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50"
              >
                Confirmar y ver la compra
              </button>
            )}

            {plan.status === "draft" ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleGoToShoppingList}
                  className="inline-flex w-full items-center justify-center rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.06)] px-3 py-2.5 text-sm font-medium text-[var(--color-paper)] transition hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
                >
                  Ver compra provisional
                </button>
                <button
                  type="button"
                  onClick={handleResetPlanningStart}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.06)] px-3 py-2.5 text-sm font-medium text-[var(--color-paper)] transition hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
                >
                  Cambiar fecha de inicio
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </SectionCard>
        </>
      ) : null}
    </>
  );
}

async function persistWeeklyPlan(plan: WeeklyPlan) {
  const response = await fetch("/api/weekly-plan", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(plan),
  });
  if (!response.ok) throw new Error("Unable to save plan");
}

async function deleteWeeklyPlan(planId: string) {
  const response = await fetch(`/api/weekly-plan?planId=${encodeURIComponent(planId)}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Unable to delete plan");
}

function findSlotById(plan: WeeklyPlan | null, slotId: string | null): MealSlot | null {
  if (!plan || !slotId) {
    return null;
  }

  return plan.days.flatMap((day) => day.slots).find((slot) => slot.id === slotId) ?? null;
}
