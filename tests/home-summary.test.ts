import assert from "node:assert/strict";
import test from "node:test";
import { buildHomeSummary, findHomeDay } from "../features/home/home-summary-data";
import { recipes } from "../lib/data/recipe-catalog";
import { buildDefaultWeekTemplate } from "../lib/domain/default-week-template";
import { applyHouseholdToPlan } from "../lib/domain/plan-servings";
import { buildShoppingListFromPlan } from "../lib/domain/shopping-list";
import { buildNextShoppingListState } from "../lib/domain/shopping-list-state";
import { buildActivePlanFromTemplate } from "../lib/domain/weekly-plan-runtime";
import type { Household, Recipe } from "../lib/domain/types";

const household: Household = {
  id: "home-summary-house", name: "Hogar de prueba",
  planningPreferences: { mealsPerDay: ["lunch"], cookingLoad: "medium", repeatMode: "repeat-base-week", preferredStores: [] },
  members: [{ id: "member-a", name: "Ana", goal: "maintain", restrictions: [], allergies: [], dislikes: [], portionProfile: "medium" }],
};
const recipe: Recipe = {
  ...recipes[0], id: "home-recipe", baseServings: 1, portionAdjustments: [],
  ingredients: [{ id: "rice", name: "Arroz", quantity: 100, unit: "g", category: "carbs", scalable: true, amountType: "exact" }],
};
const original = buildActivePlanFromTemplate(buildDefaultWeekTemplate(household.id, 1), {
  householdId: household.id, planningStartMode: "today", referenceDate: new Date("2026-10-15T12:00:00Z"),
});
const plan = { ...original, days: original.days.map((day) => ({
  ...day, slots: day.slots.map((slot) => ({ ...slot, recipeId: recipe.id })),
})) };

test("home uses exact calendar dates and never substitutes a weekday from a different week", () => {
  const summary = buildHomeSummary(household, plan, [recipe], null);
  assert.equal(findHomeDay(summary.days, "2026-10-15")?.dayKey, "thursday");
  assert.equal(findHomeDay(summary.days, "2026-10-21")?.dayKey, "wednesday");
  assert.equal(findHomeDay(summary.days, "2026-10-22"), null);
  assert.equal(findHomeDay(summary.days, "2026-10-14"), null);
  assert.equal(findHomeDay(summary.days, ""), null);
});

test("today's links preserve each meal's serving context and exclude inactive meal types", () => {
  const summary = buildHomeSummary(household, plan, [recipe], null);
  const today = findHomeDay(summary.days, "2026-10-19")!;
  assert.equal(today.slots.length, 1);
  assert.equal(today.slots[0].mealType, "lunch");
  const url = new URL(today.slots[0].recipeHref!, "https://menumia.test");
  assert.equal(url.searchParams.get("planId"), plan.id);
  assert.equal(url.searchParams.get("slotId"), today.slots[0].id);
  assert.equal(today.slots[0].servings, 1);
});

test("home shopping progress reconciles persisted checks exactly as the shopping page does", () => {
  const list = buildShoppingListFromPlan(applyHouseholdToPlan(plan, household), [recipe]);
  const saved = buildNextShoppingListState(null, list);
  saved.items.forEach((item) => { item.checked = true; });
  const summary = buildHomeSummary(household, plan, [recipe], saved);
  assert.deepEqual(summary.shopping, { total: 1, checked: 1, percentage: 100 });
  // A larger purchase must ask the user to check the product again.
  const increased = { ...recipe, ingredients: recipe.ingredients.map((item) => ({ ...item, quantity: item.quantity * 2 })) };
  assert.deepEqual(buildHomeSummary(household, plan, [increased], saved).shopping, { total: 1, checked: 0, percentage: 0 });
  assert.equal(buildHomeSummary(household, { ...plan, id: "another-week" }, [recipe], saved).shopping.checked, 0);
});

test("home retains meal serving overrides in the displayed recipe context", () => {
  const overridden = { ...plan, days: plan.days.map((day) => ({
    ...day, slots: day.slots.map((slot) => ({ ...slot, servings: 4, servingsOverride: true })),
  })) };
  const summary = buildHomeSummary(household, overridden, [recipe], null);
  assert.equal(summary.days[0].slots[0].servings, 4);
});

test("missing and empty plans show no fictional meals or shopping progress", () => {
  const summary = buildHomeSummary(household, null, [], null);
  assert.equal(summary.status, null);
  assert.deepEqual(summary.days, []);
  assert.deepEqual(summary.shopping, { total: 0, checked: 0, percentage: 0 });
  assert.equal(buildHomeSummary(household, { ...plan, status: "confirmed", days: [] }, [], null).status, "confirmed");
  assert.deepEqual(buildHomeSummary(household, { ...plan, days: [] }, [], null).shopping, { total: 0, checked: 0, percentage: 0 });
});
