import assert from "node:assert/strict";
import test from "node:test";
import { recipes } from "../lib/data/recipe-catalog";
import { expandedRecipes } from "../lib/data/expanded-recipes";
import { buildDefaultWeekTemplate } from "../lib/domain/default-week-template";
import { buildActivePlanFromTemplate } from "../lib/domain/weekly-plan-runtime";
import { isRecipeAvailable, normalizePlanRecipes, normalizeTemplateRecipes } from "../lib/domain/recipe-availability";
import { filterRecipes } from "../lib/domain/recipe-library";
import { buildShoppingListFromPlan } from "../lib/domain/shopping-list";

function legacyTemplate() {
  const template = buildDefaultWeekTemplate("test-household", 4);
  const dinner = template.days.flatMap((day) => day.slots).find((slot) => slot.id === "sun-dinner")!;
  dinner.recipeId = "cena-aprovechamiento";
  dinner.tags = ["uses-leftovers"];
  dinner.servings = 2;
  dinner.servingsOverride = true;
  template.leftoverFlows.push({ sourceMealSlotId: "sun-lunch", targetMealSlotId: dinner.id, producedComponentId: "batch-sunday-chicken", note: "Legacy" });
  template.batchBlocks[0].feedsMealSlotIds.push(dinner.id);
  return template;
}
test("hidden leftover dinner is unavailable in all searches; 99 active recipes remain", () => {
  const catalog = [...recipes, ...expandedRecipes];
  assert.equal(isRecipeAvailable("cena-aprovechamiento"), false);
  assert.equal(filterRecipes(catalog, {}).length, 99);
  assert.equal(filterRecipes(catalog, { query: "Cena de aprovechamiento" }).length, 0);
  assert.ok(filterRecipes(catalog, { mealType: "dinner" }).every((recipe) => recipe.id !== "cena-aprovechamiento"));
  assert.ok(recipes.some((recipe) => recipe.id === "cena-aprovechamiento"));
});
test("new default menus contain a concrete dinner and no generic leftovers link", () => {
  const template = buildDefaultWeekTemplate("new-household", 5);
  assert.ok(template.days.flatMap((day) => day.slots).every((slot) => isRecipeAvailable(slot.recipeId)));
  const dinner = template.days.flatMap((day) => day.slots).find((slot) => slot.id === "sun-dinner")!;
  assert.equal(dinner.recipeId, "tortilla-calabacin");
  assert.equal(dinner.servings, 5);
  assert.deepEqual(dinner.tags, ["quick-dinner"]);
  assert.ok(template.leftoverFlows.every((flow) => flow.targetMealSlotId !== dinner.id));
});
test("persisted templates and confirmed weeks are adapted without mutating source data or losing serving overrides", () => {
  const template = legacyTemplate();
  const source = structuredClone(template);
  const normalized = normalizeTemplateRecipes(template);
  const dinner = normalized.days.flatMap((day) => day.slots).find((slot) => slot.id === "sun-dinner")!;
  assert.equal(dinner.recipeId, "tortilla-calabacin");
  assert.equal(dinner.servings, 2);
  assert.equal(dinner.servingsOverride, true);
  assert.deepEqual(template, source);
  assert.ok(normalized.leftoverFlows.every((flow) => flow.targetMealSlotId !== dinner.id && flow.sourceMealSlotId !== dinner.id));
  assert.ok(normalized.batchBlocks.every((block) => !block.feedsMealSlotIds.includes(dinner.id)));
  const plan = { ...buildActivePlanFromTemplate(template, { householdId: "test-household", planningStartMode: "today" }), status: "confirmed" as const, confirmedAt: "2026-10-12T10:00:00Z" };
  const adapted = normalizePlanRecipes(plan);
  assert.equal(adapted.id, plan.id);
  assert.equal(adapted.status, "draft");
  assert.equal(adapted.confirmedAt, plan.confirmedAt);
  assert.equal(plan.status, "confirmed");
  assert.equal(normalizePlanRecipes(adapted), adapted);
  assert.equal(normalizeTemplateRecipes(normalized), normalized);
  const catalog = [...recipes, ...expandedRecipes].filter((recipe) => isRecipeAvailable(recipe.id));
  const items = buildShoppingListFromPlan(adapted, catalog).categories.flatMap((category) => category.items);
  assert.ok(items.every((item) => !/sobrante/i.test(item.name)));
  assert.ok(items.some((item) => item.name === "Huevos"));
});
