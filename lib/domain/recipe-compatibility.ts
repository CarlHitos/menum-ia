import { normalizeStandaloneRecipe } from "@/lib/domain/standalone-recipes";
import type { Recipe } from "@/lib/domain/types";

// Read-time upgrade for the original catalogue already stored in JSON columns.
// No database overwrite is needed to use the corrected serving semantics.
const exactIngredientIds = new Set([
  "cocoa-overnight", "broth-cream-dinner", "soy-teriyaki-dinner",
  "honey-teriyaki-dinner", "soy-stir",
]);

export function normalizeRecipeForServings(recipe: Recipe): Recipe {
  return normalizeStandaloneRecipe({
    ...recipe,
    portionAdjustments: recipe.portionAdjustments.filter(
      (adjustment) => !["carlos", "mandy", "sergi"].includes(adjustment.memberId),
    ),
    ingredients: recipe.ingredients.map((ingredient) => ({
      ...ingredient,
      amountType: ingredient.amountType ?? (
        exactIngredientIds.has(ingredient.id) || ingredient.scalable ? "exact"
          : ingredient.name.toLowerCase() === "canela" ? "to_taste" : "as_needed"
      ),
    })),
    steps: recipe.steps.map((step) => ({
      ...step,
      detail: step.detail.replace(/en tres (bols|recipientes|cuencos)/g, "entre los comensales")
        .replace(/entre los tres bowls/g, "entre los comensales"),
    })),
  });
}
