import assert from "node:assert/strict";
import test from "node:test";
import { formatRecipeAmount } from "../features/recipes/ingredient-amount";
import { scaleRecipeIngredients } from "../lib/domain/portioning";
import { recipes } from "../lib/data/recipe-catalog";

test("recipe quantities use practical weights and fractions, not purchase rounding", () => {
  assert.equal(formatRecipeAmount(8.33, "g", "exact"), "≈ 10 g");
  assert.equal(formatRecipeAmount(0.67, "ud", "exact"), "2/3 ud");
  assert.equal(formatRecipeAmount(0.5, "ud", "exact"), "1/2 ud");
  assert.equal(formatRecipeAmount(1.25, "unit", "exact"), "1 1/4 ud");
  assert.equal(formatRecipeAmount(0.99, "ud", "exact"), "1 ud");
  assert.equal(formatRecipeAmount(125, "g", "exact"), "125 g");
  assert.equal(formatRecipeAmount(1.67, "g", "exact"), "≈ 1,7 g");
  assert.equal(formatRecipeAmount(0.03, "g", "exact"), "< 0,1 g");
  assert.equal(formatRecipeAmount(null, "g", "to_taste"), "Al gusto");
  assert.equal(formatRecipeAmount(null, "ml", "as_needed"), "Según necesidad");
});

test("recipe presentation never changes source or scaled quantities", () => {
  const recipe = recipes.find((recipe) => recipe.ingredients.some((ingredient) => ingredient.scalable))!;
  const original = JSON.stringify(recipe);
  const scaled = scaleRecipeIngredients(recipe, 1);
  const exact = JSON.stringify(scaled);
  for (const ingredient of scaled) {
    formatRecipeAmount(ingredient.recipeAmount, ingredient.unit, ingredient.amountType);
  }
  assert.equal(JSON.stringify(recipe), original);
  assert.equal(JSON.stringify(scaled), exact);
});
