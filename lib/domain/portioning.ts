import type { Recipe, RecipeIngredient } from "@/lib/domain/types";

export function isValidServings(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}

export function getAmountType(ingredient: RecipeIngredient) {
  return ingredient.amountType ?? (ingredient.scalable ? "exact" : "as_needed");
}

export function scaleRecipeIngredients(recipe: Recipe, requestedServings: number) {
  if (!isValidServings(recipe.baseServings) || !isValidServings(requestedServings)) {
    throw new Error("Servings must be positive integers");
  }
  const factor = requestedServings / recipe.baseServings;
  return recipe.ingredients.map((ingredient) => {
    if (!Number.isFinite(ingredient.quantity) || ingredient.quantity < 0) {
      throw new Error(`Invalid ingredient quantity: ${ingredient.id}`);
    }
    const amountType = getAmountType(ingredient);
    return {
      ...ingredient,
      amountType,
      // Personal adjustments need explicit participants; global catalogue
      // adjustments must never be applied to every household.
      recipeAmount: amountType === "exact" ? ingredient.quantity * factor : null,
    };
  });
}

export function formatQuantity(quantity: number) {
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(quantity);
}

export function formatIngredientAmount(quantity: number | null, unit: string, amountType: RecipeIngredient["amountType"]) {
  if (amountType === "to_taste") return "Al gusto";
  if (quantity === null || amountType === "as_needed") return "Según necesidad";
  return `${formatQuantity(quantity)} ${unit}`;
}
