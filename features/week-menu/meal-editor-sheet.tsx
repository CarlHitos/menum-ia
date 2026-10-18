"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { RecipeBrowser } from "@/features/recipes/recipe-browser";
import { formatMealTypeLabel } from "@/lib/domain/weekly-plan-preview";
import type { MealSlot, Recipe } from "@/lib/domain/types";

type Props = {
  slot: MealSlot;
  dayLabel: string;
  recipes: Recipe[];
  householdSize: number;
  onClose: () => void;
  onApply: (recipe: Recipe | null, servings: number, override: boolean) => void;
};

export function MealEditorSheet({ slot, dayLabel, recipes, householdSize, onClose, onApply }: Props) {
  const [servings, setServings] = useState(slot.servings);
  const [override, setOverride] = useState(slot.servingsOverride ?? false);
  const changed = servings !== slot.servings || override !== Boolean(slot.servingsOverride);

  return (
    <BottomSheet
      title={`Cambiar ${formatMealTypeLabel(slot.mealType)}`}
      description={dayLabel}
      onClose={onClose}
    >
      <RecipeBrowser
        layout="sheet"
        recipes={recipes}
        mealType={slot.mealType}
        selectedId={slot.recipeId}
        onSelect={(recipe) => onApply(recipe, servings, override)}
        leadingControls={
          <div className="rounded-2xl bg-[rgba(255,255,255,0.06)] px-3 py-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">Comensales</span>
              <div className="flex items-center gap-3">
                <button type="button" aria-label="Un comensal menos" disabled={servings <= 1} onClick={() => { setServings(servings - 1); setOverride(true); }} className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] after:absolute after:-inset-0.5 after:content-[''] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] disabled:opacity-30"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" d="M5 12h14" /></svg></button>
                <output aria-live="polite" aria-label="Comensales para esta comida" className="min-w-4 text-center text-base font-semibold">{servings}</output>
                <button type="button" aria-label="Un comensal más" onClick={() => { setServings(servings + 1); setOverride(true); }} className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] after:absolute after:-inset-0.5 after:content-[''] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg></button>
              </div>
            </div>
            {override ? <button type="button" onClick={() => { setServings(householdSize); setOverride(false); }} className="min-h-9 text-xs text-[var(--color-muted)] underline">Usar tamaño del hogar ({householdSize})</button> : null}
            {changed ? <button type="button" onClick={() => onApply(null, servings, override)} className="mt-1 min-h-11 w-full rounded-full bg-[var(--color-accent)] px-3 text-sm font-semibold text-slate-950">Guardar comensales</button> : null}
          </div>
        }
      />
    </BottomSheet>
  );
}
