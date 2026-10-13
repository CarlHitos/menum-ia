import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StatPill } from "../components/ui/stat-pill";
import { recipes } from "../lib/data/recipe-catalog";
import { expandedRecipes } from "../lib/data/expanded-recipes";
import { mealTypeOrder, isMealType } from "../lib/domain/meal-types";
import { buildDefaultWeekTemplate } from "../lib/domain/default-week-template";
import { buildActivePlanFromTemplate } from "../lib/domain/weekly-plan-runtime";
import { applyHouseholdToPlan, hasValidPlanServings, resolvePlanServings, updateSlotServings } from "../lib/domain/plan-servings";
import { buildWeeklyPlanPreview } from "../lib/domain/weekly-plan-preview";
import { canPlanRecipe, filterRecipes } from "../lib/domain/recipe-library";
import { buildShoppingListFromPlan } from "../lib/domain/shopping-list";
import { loadOnboardingDraft, saveOnboardingDraft } from "../lib/local-storage/onboarding-storage";
import { buildInitialOnboardingDraft } from "../lib/local-storage/onboarding-mappers";
import type { Household, WeeklyPlan } from "../lib/domain/types";

const catalog = [...recipes, ...expandedRecipes];
function household(enabled: boolean): Household {
  return { id: "test-household", name: "Casa larga de ejemplo para probar el resumen", members: Array.from({ length: 4 }, (_, index) => ({ id: `member-${index}`, name: `Persona ${index}`, goal: "maintain", allergies: [], restrictions: [], dislikes: [], portionProfile: "medium" })), planningPreferences: { mealsPerDay: mealTypeOrder.filter((meal) => enabled || meal !== "mid-morning"), cookingLoad: "medium", repeatMode: "repeat-base-week", preferredStores: [] } };
}
function oldPlan(): WeeklyPlan {
  return { ...buildActivePlanFromTemplate(buildDefaultWeekTemplate("test-household", 4), { householdId: "test-household", planningStartMode: "next-monday", referenceDate: new Date("2026-10-12T12:00:00Z") }), status: "confirmed", confirmedAt: "2026-10-12T12:00:00Z" };
}
test("media mañana remains opt-in and completes saved weeks without replacing existing recipes or serving overrides", () => {
  const plan = oldPlan();
  const original = structuredClone(plan);
  const existing = plan.days[0].slots[0];
  existing.servingsOverride = true; existing.servings = 2;
  const withoutMorning = resolvePlanServings(plan, household(false));
  assert.equal(withoutMorning.days.flatMap((day) => day.slots).length, 28);
  assert.equal(withoutMorning.status, "confirmed");
  const adapted = resolvePlanServings(plan, household(true));
  assert.equal(adapted.days.flatMap((day) => day.slots).length, 35);
  assert.equal(adapted.status, "draft");
  assert.equal(adapted.confirmedAt, original.confirmedAt);
  assert.equal(adapted.id, plan.id);
  assert.ok(hasValidPlanServings(adapted.days));
  for (const day of adapted.days) {
    const morning = day.slots.filter((slot) => slot.mealType === "mid-morning");
    assert.equal(morning.length, 1);
    assert.equal(morning[0].servings, 4);
    assert.ok(catalog.some((recipe) => recipe.id === morning[0].recipeId && canPlanRecipe(recipe, "mid-morning")));
    const before = plan.days.find((entry) => entry.dayKey === day.dayKey)!;
    assert.deepEqual(day.slots.filter((slot) => slot.mealType !== "mid-morning"), before.slots);
  }
  assert.ok(plan.days.every((day) => day.slots.length === 4));
  assert.deepEqual(resolvePlanServings(adapted, household(true)), adapted);
  const preview = buildWeeklyPlanPreview(adapted, catalog, mealTypeOrder);
  assert.deepEqual(preview[0].slots.map((slot) => slot.mealLabel), ["Desayuno", "Media mañana", "Comida", "Merienda", "Cena"]);
});
test("turning media mañana off excludes it from menu and shopping while keeping its recipe and servings for reactivation", () => {
  let plan = resolvePlanServings(oldPlan(), household(true));
  const morning = plan.days[0].slots.find((slot) => slot.mealType === "mid-morning")!;
  morning.recipeId = "hummus-zanahoria-tortitas";
  plan = updateSlotServings(plan, morning.id, 2);
  const retained = resolvePlanServings(plan, household(false));
  assert.equal(retained.days.flatMap((day) => day.slots).length, 35);
  const visible = applyHouseholdToPlan(retained, household(false));
  assert.ok(visible.days.every((day) => day.slots.length === 4));
  const sourceSlots = buildShoppingListFromPlan(visible, catalog).categories.flatMap((category) => category.items).flatMap((item) => item.sourceMealSlotIds);
  assert.ok(!sourceSlots.includes(morning.id));
  const restored = resolvePlanServings(retained, household(true));
  const actual = restored.days.flatMap((day) => day.slots).find((slot) => slot.id === morning.id)!;
  assert.equal(actual.servings, 2);
  assert.equal(actual.recipeId, morning.recipeId);
});
test("the same recipe at media mañana and merienda adds both independently scaled servings to shopping", () => {
  const recipe = recipes.find((entry) => entry.id === "yogur-fruta-semillas")!;
  const plan = oldPlan();
  plan.days = [{ dayKey: "monday", label: "Lun", slots: [
    { id: "morning", dayKey: "monday", mealType: "mid-morning", recipeId: recipe.id, servings: 2, servingsOverride: true, tags: [] },
    { id: "afternoon", dayKey: "monday", mealType: "snack", recipeId: recipe.id, servings: 4, servingsOverride: true, tags: [] },
  ] }];
  const active = applyHouseholdToPlan(plan, household(true));
  const items = buildShoppingListFromPlan(active, catalog).categories.flatMap((category) => category.items);
  const yogurt = recipe.ingredients.find((item) => item.name.toLowerCase().includes("yogur"))!;
  const purchase = items.find((item) => item.name === yogurt.name)!;
  assert.ok(Math.abs(purchase.totalNeeded! - yogurt.quantity * 6 / recipe.baseServings) < 1e-9);
  assert.deepEqual(purchase.sourceMealSlotIds, ["morning", "afternoon"]);
  const preview = buildWeeklyPlanPreview(active, catalog);
  assert.ok(preview[0].slots[0].recipeHref?.includes("slotId=morning"));
  assert.ok(preview[0].slots[1].recipeHref?.includes("slotId=afternoon"));
});
test("legacy and persisted imported snack recipes work in either moment without duplicating recipes", () => {
  const compatible = filterRecipes(catalog, { mealType: "mid-morning" });
  const snacks = filterRecipes(catalog, { mealType: "snack" });
  assert.deepEqual(compatible.map((recipe) => recipe.id), snacks.map((recipe) => recipe.id));
  assert.ok(compatible.length > 0);
  assert.ok(compatible.some((recipe) => recipe.catalogMetadata));
  assert.ok(!filterRecipes(catalog, { mealType: "mid-morning" }).some((recipe) => recipe.catalogMetadata?.kind === "sauce"));
  assert.equal(isMealType("mid-morning"), true);
  assert.equal(isMealType("brunch-unknown"), false);
});
test("local drafts preserve the new option after reload and the summary uses a compact daily count", () => {
  const stored = new Map<string, string>();
  const previous = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: { getItem: (key: string) => stored.get(key) ?? null, setItem: (key: string, value: string) => stored.set(key, value) } } });
  try {
    const draft = buildInitialOnboardingDraft(household(true));
    saveOnboardingDraft(draft, "test-user");
    assert.deepEqual(loadOnboardingDraft("test-user")?.mealsPerDay, mealTypeOrder);
    saveOnboardingDraft(buildInitialOnboardingDraft(household(false)), "old-user");
    assert.ok(!loadOnboardingDraft("old-user")?.mealsPerDay.includes("mid-morning"));
    const html = renderToStaticMarkup(createElement(StatPill, { label: "Comidas", value: "5", suffix: "/ día" }));
    assert.match(html, />5<span/);
    assert.match(html, /\/ día/);
    assert.doesNotMatch(html, /Desayuno/);
  } finally {
    if (previous) Object.defineProperty(globalThis, "window", previous);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
