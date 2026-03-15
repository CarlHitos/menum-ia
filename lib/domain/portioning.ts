import type { PortionAdjustment, RecipeIngredient } from "@/lib/domain/types";

export function getIngredientAdjustmentTotal(
  ingredient: RecipeIngredient,
  adjustments: PortionAdjustment[],
) {
  return adjustments
    .filter(
      (adjustment) =>
        adjustment.ingredientId === ingredient.id && adjustment.unit === ingredient.unit,
    )
    .reduce((total, adjustment) => total + adjustment.deltaQuantity, 0);
}
