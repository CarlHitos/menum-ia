import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { recipes } from "../lib/data/recipe-catalog";
import { expandedRecipes } from "../lib/data/expanded-recipes";
import { normalizeStandaloneRecipe } from "../lib/domain/standalone-recipes";
import { normalizeRecipeForServings } from "../lib/domain/recipe-compatibility";
import { scaleRecipeIngredients } from "../lib/domain/portioning";
import { isRecipeAvailable } from "../lib/domain/recipe-availability";
import { buildDefaultWeekTemplate } from "../lib/domain/default-week-template";
import { buildActivePlanFromTemplate } from "../lib/domain/weekly-plan-runtime";
import { buildShoppingListFromPlan } from "../lib/domain/shopping-list";
import { buildWeeklyPlanPreview } from "../lib/domain/weekly-plan-preview";
import { RecipeDetailClient } from "../features/recipes/recipe-detail-client";
import { CookingMode } from "../features/cooking/cooking-mode";
import type { Recipe } from "../lib/domain/types";

function legacyPizza(): Recipe {
  const recipe = structuredClone(recipes.find((recipe) => recipe.id === "pizza-casera-rapida")!);
  return { ...recipe, durationMinutes: 18, utensils: ["Horno"], description: "Salsa preparada de otra comida",
    ingredients: [...recipe.ingredients.filter((item) => !["pizza-beef", "pizza-tomato-sauce"].includes(item.id)), { id: "meat-sauce-pizza", name: "Salsa de carne", quantity: 250, unit: "g", category: "protein", scalable: true, amountType: "exact", componentRef: "batch-meat-sauce" }],
    steps: recipe.steps.filter((step) => step.id !== "cook-pizza-sauce"),
  };
}
test("all active recipe descriptions and instructions omit cross-meal reuse, while future metadata stays available", () => {
  for (const recipe of [...recipes, ...expandedRecipes].filter((recipe) => isRecipeAvailable(recipe.id))) {
    assert.doesNotMatch(JSON.stringify([recipe.description, recipe.steps]), /batch|sobras|reutiliz|otra noche|otra comida|base de semana|arranque semanal|taper|táper/i, recipe.id);
  }
  assert.ok(recipes.find((recipe) => recipe.id === "arroz-pollo-verduras")!.baseYield?.length);
  assert.ok(recipes.find((recipe) => recipe.id === "pasta-carne-tomate")!.leftoverNotes);
});
test("stored legacy pizza upgrades to raw ingredients and a sauce cooking step without overwriting the input or doubling quantities", () => {
  const original = legacyPizza();
  const snapshot = structuredClone(original);
  const adapted = normalizeRecipeForServings(original);
  assert.deepEqual(original, snapshot);
  assert.ok(!adapted.ingredients.some((item) => item.name === "Salsa de carne"));
  assert.equal(adapted.ingredients.find((item) => item.id === "pizza-beef")!.quantity, 150);
  assert.equal(adapted.ingredients.find((item) => item.id === "pizza-tomato-sauce")!.quantity, 200);
  assert.equal(adapted.steps.filter((step) => step.id === "cook-pizza-sauce").length, 1);
  assert.equal(adapted.durationMinutes, 30);
  assert.ok(adapted.utensils.includes("Sartén"));
  assert.deepEqual(normalizeRecipeForServings(adapted), adapted);
  for (const servings of [1, 2, 4, 7]) {
    const meat = scaleRecipeIngredients(adapted, servings).find((item) => item.id === "pizza-beef")!;
    assert.equal(meat.recipeAmount, 150 * (servings / adapted.baseServings));
  }
});
test("wraps cook fresh chicken and stir-fry includes cooking its listed dry rice, with consistent estimated times", () => {
  const wraps = { ...recipes.find((recipe) => recipe.id === "wraps-pollo")!, durationMinutes: 15 };
  const adapted = normalizeStandaloneRecipe(wraps);
  assert.equal(adapted.durationMinutes, 20);
  assert.equal(adapted.steps.find((step) => step.id === "heat-filling")!.timerSeconds, 600);
  assert.match(adapted.steps.find((step) => step.id === "heat-filling")!.detail, /Corta el pollo/);
  const stir = recipes.find((recipe) => recipe.id === "salteado-arroz-pavo")!;
  const legacy = { ...stir, durationMinutes: 18, steps: stir.steps.filter((step) => step.id !== "cook-rice-stir") };
  const cooked = normalizeStandaloneRecipe(legacy);
  assert.equal(cooked.durationMinutes, 35);
  assert.equal(cooked.ingredients.find((item) => item.id === "rice-stir")!.name, "Arroz");
  assert.equal(cooked.steps[0].id, "cook-rice-stir");
  assert.equal(cooked.steps.filter((step) => step.id === "cook-rice-stir").length, 1);
  assert.deepEqual(normalizeStandaloneRecipe(cooked), cooked);
});
test("weekly shopping consolidates pasta and pizza raw ingredients without buying an unexpanded meat sauce", () => {
  const pizza = normalizeRecipeForServings(legacyPizza());
  const pasta = recipes.find((recipe) => recipe.id === "pasta-carne-tomate")!;
  const plan = buildActivePlanFromTemplate(buildDefaultWeekTemplate("test", 4), { householdId: "test", planningStartMode: "today" });
  plan.days = [{ dayKey: "monday", label: "Lun", slots: [pasta, pizza].map((recipe, index) => ({ id: `meal-${index}`, dayKey: "monday", recipeId: recipe.id, mealType: recipe.category, servings: 4, tags: [] })) }];
  const items = buildShoppingListFromPlan(plan, [pasta, pizza]).categories.flatMap((category) => category.items);
  assert.equal(items.filter((item) => item.name === "Carne picada").length, 1);
  assert.ok(Math.abs(items.find((item) => item.name === "Carne picada")!.totalNeeded! - 800) < 1e-9);
  assert.ok(Math.abs(items.find((item) => item.name === "Tomate triturado")!.totalNeeded! - 800) < 1e-9);
  assert.ok(!items.some((item) => /salsa de carne/i.test(item.name)));
});
test("changing a recipe cannot inherit promotional reuse descriptions from stored meal tags", () => {
  const plan = buildActivePlanFromTemplate(buildDefaultWeekTemplate("test", 2), { householdId: "test", planningStartMode: "today" });
  const replacement = expandedRecipes.find((recipe) => recipe.catalogMetadata?.kind === "bowl")!;
  plan.days[0].slots[0].recipeId = replacement.id;
  plan.days[0].slots[0].tags = ["batch-friendly", "uses-leftovers"];
  const preview = buildWeeklyPlanPreview(plan, [...recipes, ...expandedRecipes]);
  assert.equal(preview[0].slots[0].description, replacement.description);
  assert.ok(plan.days[0].slots[0].tags.includes("batch-friendly"));
});
test("recipe detail shows corrected pizza ingredients and cooking exposes its corrected steps", () => {
  const recipe = normalizeRecipeForServings(legacyPizza());
  const query = "?planId=test&slotId=pizza";
  const detail = renderToStaticMarkup(createElement(RecipeDetailClient, { recipe, requestedServings: 4, contextQuery: query }));
  const cooking = renderToStaticMarkup(createElement(CookingMode, { recipe, requestedServings: 4, contextQuery: query }));
  assert.match(detail, /Carne picada/);
  assert.match(detail, /Tomate triturado/);
  assert.match(detail, /200 g/);
  assert.doesNotMatch(cooking, /Ingredientes para/);
  for (const html of [detail, cooking]) {
    assert.doesNotMatch(html, /Salsa de carne|sobras|del miercoles/);
  }
  assert.match(detail, /planId=test&amp;slotId=pizza/);
  assert.match(cooking, /Cocina carne y tomate/);
});
