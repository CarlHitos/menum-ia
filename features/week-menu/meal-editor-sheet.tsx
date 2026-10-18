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
          <div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold">Comensales</span>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Un comensal menos" disabled={servings <= 1} onClick={() => { setServings(servings - 1); setOverride(true); }} className="h-11 w-11 rounded-full border border-[var(--color-border)] disabled:opacity-30">−</button>
                <output aria-live="polite" aria-label="Comensales para esta comida" className="min-w-5 text-center text-lg font-semibold">{servings}</output>
                <button type="button" aria-label="Un comensal más" onClick={() => { setServings(servings + 1); setOverride(true); }} className="h-11 w-11 rounded-full border border-[var(--color-border)]">+</button>
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
