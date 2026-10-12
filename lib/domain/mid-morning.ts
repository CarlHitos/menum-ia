import type { MealSlot, PlannedDay } from "./types";

const defaultRecipes = ["manzana-almendra-canela", "yogur-fruta-semillas", "queso-fruta-nueces"];
export function addMidMorningSlots(days: PlannedDay[], servings: number): PlannedDay[] {
  const usedIds = new Set(days.flatMap((day) => day.slots.map((slot) => slot.id)));
  return days.map((day, index) => {
    if (day.slots.some((slot) => slot.mealType === "mid-morning")) return day;
    const baseId = `${day.dayKey}-mid-morning`;
    let id = baseId;
    let suffix = 1;
    while (usedIds.has(id)) id = `${baseId}-${suffix++}`;
    usedIds.add(id);
    const slot: MealSlot = { id, dayKey: day.dayKey, mealType: "mid-morning", recipeId: defaultRecipes[index % defaultRecipes.length], servings, tags: [] };
    const lunchIndex = day.slots.findIndex((entry) => entry.mealType === "lunch");
    const position = lunchIndex < 0 ? day.slots.length : lunchIndex;
    return { ...day, slots: [...day.slots.slice(0, position), slot, ...day.slots.slice(position)] };
  });
}
