import type { MealType } from "./types";

export const mealTypeOrder: MealType[] = ["breakfast", "mid-morning", "lunch", "snack", "dinner"];
export const mealTypeLabels: Record<MealType, string> = {
  breakfast: "Desayuno", "mid-morning": "Media mañana", lunch: "Comida", snack: "Merienda", dinner: "Cena",
};
export function isMealType(value: unknown): value is MealType {
  return typeof value === "string" && mealTypeOrder.includes(value as MealType);
}
