import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RecipeDetailClient } from "../features/recipes/recipe-detail-client";
import { CookingMode } from "../features/cooking/cooking-mode";
import { ShoppingListClient } from "../features/shopping-list/shopping-list-client";
import { formatShoppingAmount } from "../features/shopping-list/shopping-quantity";
import { recipes } from "../lib/data/recipe-catalog";
import { buildDefaultWeekTemplate } from "../lib/domain/default-week-template";
import { calculatePurchaseAmount, ingredientKey } from "../lib/domain/ingredient-identity";
import { applyHouseholdToPlan, hasValidPlanServings, resolvePlanServings, updateSlotServings } from "../lib/domain/plan-servings";
import { scaleRecipeIngredients } from "../lib/domain/portioning";
import { normalizeRecipeForServings } from "../lib/domain/recipe-compatibility";
import { buildShoppingListFromPlan } from "../lib/domain/shopping-list";
import { buildNextShoppingListState, flattenShoppingItems } from "../lib/domain/shopping-list-state";
import { buildActivePlanFromTemplate } from "../lib/domain/weekly-plan-runtime";
import { buildWeeklyPlanPreview } from "../lib/domain/weekly-plan-preview";
import type { Household, Recipe, RecipeIngredient, ShoppingListState, WeeklyPlan } from "../lib/domain/types";

function ingredient(quantity: number, name = "Cebolla", unit = "ud", overrides: Partial<RecipeIngredient> = {}): RecipeIngredient {
  return { id: "ingredient", name, quantity, unit, category: "vegetables", scalable: true, amountType: "exact", ...overrides };
}

function recipe(id: string, ingredients: RecipeIngredient[], baseServings = 1): Recipe {
  return { ...recipes[0], id, baseServings, ingredients, portionAdjustments: [] };
}

function household(count: number, meals: Household["planningPreferences"]["mealsPerDay"] = ["lunch"]): Household {
  return {
    id: "household-test", name: "Hogar", planningPreferences: {
      mealsPerDay: meals, cookingLoad: "medium", repeatMode: "repeat-base-week", preferredStores: [],
    },
    members: Array.from({ length: count }, (_, index) => ({
      id: `real-member-${index}`, name: `Persona ${index}`, goal: "maintain", restrictions: [], allergies: [], dislikes: [], portionProfile: "medium",
    })),
  };
}

function planFor(catalog: Recipe[], servings = 1): WeeklyPlan {
  const plan = buildActivePlanFromTemplate(buildDefaultWeekTemplate("household-test", servings), {
    householdId: "household-test", planningStartMode: "today", referenceDate: new Date("2026-10-05T12:00:00Z"),
  });
  return { ...plan, days: [{ dayKey: "monday", label: "Lun", slots: catalog.map((recipe, index) => ({
    id: `slot-${index}`, dayKey: "monday", mealType: "lunch", recipeId: recipe.id, servings, tags: [],
  })) }] };
}

function itemsFor(catalog: Recipe[], servings = 1) {
  return flattenShoppingItems(buildShoppingListFromPlan(planFor(catalog, servings), catalog).categories);
}

test("base 2 → requested 4 scales quinoa, feta and avocado without changing the recipe", () => {
  const original = recipe("bowl", [ingredient(120, "Quinoa", "g"), ingredient(80, "Feta", "g"), ingredient(1, "Aguacate")], 2);
  assert.deepEqual(scaleRecipeIngredients(original, 4).map((item) => item.recipeAmount), [240, 160, 2]);
  assert.equal(original.ingredients[0].quantity, 120);
});

test("0.4 + 0.6 onions are aggregated before purchase rounding", () => {
  const items = itemsFor([recipe("a", [ingredient(0.4)]), recipe("b", [ingredient(0.6, "cebollas")])]);
  assert.equal(items.length, 1);
  assert.equal(items[0].totalNeeded, 1);
  assert.equal(items[0].purchaseAmount, 1);
  assert.deepEqual(items[0].sourceRecipeIds, ["a", "b"]);
});

test("weekly sum retains thirds instead of rounding each recipe to 0.33", () => {
  const repeated = recipe("third", [ingredient(1)], 3);
  const items = itemsFor([repeated, repeated, repeated]);
  assert.equal(items[0].totalNeeded, 1);
  assert.equal(items[0].purchaseAmount, 1);
  assert.equal(items[0].sourceMealSlotIds.length, 3);
  assert.equal(items[0].sourceRecipeIds.length, 1);
});

test("540 g + 450 g of the same chicken cut is one 990 g purchase", () => {
  const items = itemsFor([recipe("a", [ingredient(540, "Pechuga de pollo", "g")]), recipe("b", [ingredient(450, "pechugas de pollo", "g")])]);
  assert.equal(items.length, 1);
  assert.equal(items[0].purchaseAmount, 990);
});

test("reviewed productId can consolidate an ambiguous label without a global chicken alias", () => {
  const items = itemsFor([recipe("a", [ingredient(540, "Pollo", "g", { productId: "chicken-breast" })]), recipe("b", [ingredient(450, "Pechuga de pollo", "g", { productId: "chicken-breast" })])]);
  assert.equal(items.length, 1);
  assert.equal(items[0].purchaseAmount, 990);
  assert.notEqual(ingredientKey("Pollo cocinado", "g"), ingredientKey("Pollo", "g"));
});

test("unit purchases retain 2.6 needed while showing 3 to buy", () => {
  const [item] = itemsFor([recipe("avocado", [ingredient(2.6, "Aguacate")])]);
  assert.equal(item.totalNeeded, 2.6);
  assert.equal(item.purchaseAmount, 3);
  assert.equal(item.quantity, 3);
});

test("floating point noise must not add an extra whole unit", () => {
  assert.equal(calculatePurchaseAmount(3.0000000000000004, "ud"), 3);
  assert.equal(calculatePurchaseAmount(3.0001, "ud"), 4);
});

test("mass and volume normalize separately; cooked and dry products remain distinct", () => {
  const items = itemsFor([recipe("a", [ingredient(0.5, "Arroz", "kg"), ingredient(250, " arroz ", "g"), ingredient(300, "Arroz cocido", "g"), ingredient(1, "Leche", "l"), ingredient(250, "Leche", "ml")])]);
  assert.equal(items.find((item) => item.id === "arroz:g")?.totalNeeded, 750);
  assert.equal(items.find((item) => item.id === "arroz cocido:g")?.totalNeeded, 300);
  assert.equal(items.find((item) => item.id === "leche:ml")?.totalNeeded, 1250);
  assert.notEqual(ingredientKey("Tomate", "ud"), ingredientKey("Tomate", "g"));
});

test("to-taste/as-needed ingredients remain qualitative across servings and repeated recipes", () => {
  const original = recipe("seasoning", [ingredient(1, "Sal", "g", { amountType: "to_taste" }), ingredient(20, "Aceite", "ml", { amountType: "as_needed" })]);
  assert.deepEqual(scaleRecipeIngredients(original, 5).map((item) => item.recipeAmount), [null, null]);
  const items = itemsFor([original, original], 5);
  assert(items.every((item) => item.purchaseAmount === 0 && item.hasUnquantifiedAmount));
  assert.equal(items.find((item) => item.name === "Sal")?.amountType, "to_taste");
});

test("exact and qualitative use of the same ingredient preserves both requirements", () => {
  const items = itemsFor([recipe("cook", [ingredient(20, "Aceite", "ml", { amountType: "as_needed" })]), recipe("sauce", [ingredient(40, "Aceite", "ml")])]);
  assert.equal(items.length, 1);
  assert.equal(items[0].totalNeeded, 40);
  assert.equal(items[0].amountType, "exact");
  assert.equal(items[0].hasUnquantifiedAmount, true);
});

test("future pantry subtraction happens before purchase rounding", () => {
  assert.equal(calculatePurchaseAmount(750, "g", 300), 450);
  assert.equal(calculatePurchaseAmount(2.6, "ud", 0.6), 2);
  assert.equal(calculatePurchaseAmount(200, "g", 300), 0);
});

test("invalid servings and ingredient quantities fail explicitly", () => {
  for (const servings of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => scaleRecipeIngredients(recipes[0], servings));
  assert.throws(() => scaleRecipeIngredients({ ...recipes[0], baseServings: 0 }, 2));
  assert.throws(() => scaleRecipeIngredients(recipe("bad", [ingredient(-1)]), 2));
});

test("all 33 current recipes scale to 1, 2, 4 and 5 servings without demo adjustments", () => {
  assert.equal(recipes.length, 33);
  for (const recipe of recipes) {
    assert.equal(recipe.portionAdjustments.length, 0);
    assert(!recipe.steps.some((step) => /tres (bols|bowls|recipientes|cuencos)/.test(step.detail)));
    for (const count of [1, 2, 4, 5]) {
      for (const item of scaleRecipeIngredients(recipe, count)) {
        if (item.amountType === "exact") assert.equal(item.recipeAmount, item.quantity * (count / recipe.baseServings));
        else assert.equal(item.recipeAmount, null);
      }
    }
  }
});

test("persisted legacy recipes are upgraded without rewriting the source", () => {
  const legacy = recipe("legacy", [ingredient(700, "Caldo", "ml", { id: "broth-cream-dinner", scalable: false, amountType: undefined })]);
  legacy.portionAdjustments = [{ id: "demo", memberId: "carlos", ingredientId: "broth-cream-dinner", deltaQuantity: 100, unit: "ml" }];
  legacy.steps = [{ id: "step", title: "Servir", detail: "Reparte en tres bols." }];
  const upgraded = normalizeRecipeForServings(legacy);
  assert.equal(upgraded.portionAdjustments.length, 0);
  assert.equal(upgraded.steps[0].detail, "Reparte entre los comensales.");
  assert.equal(scaleRecipeIngredients(upgraded, 2)[0].recipeAmount, 1400);
  assert.equal(legacy.portionAdjustments.length, 1);
});

test("catalogue personal adjustments are never silently applied to other households", () => {
  const original = recipe("demo", [ingredient(100, "Arroz", "g")]);
  original.portionAdjustments = [{ id: "extra", memberId: "carlos", ingredientId: "ingredient", deltaQuantity: 50, unit: "g" }];
  assert.equal(itemsFor([original], 2)[0].totalNeeded, 200);
});

test("household meals determine both visible menu and shopping; defaults follow current household size", () => {
  const template = buildDefaultWeekTemplate("household-test", 3);
  const plan = buildActivePlanFromTemplate(template, { householdId: "household-test", planningStartMode: "today" });
  const scoped = applyHouseholdToPlan(plan, household(4, ["dinner"]));
  assert(scoped.days.every((day) => day.slots.length === 1 && day.slots[0].mealType === "dinner" && day.slots[0].servings === 4));
  const visibleSlotIds = new Set(buildWeeklyPlanPreview(scoped, recipes).flatMap((day) => day.slots.map((slot) => slot.id)));
  assert(flattenShoppingItems(buildShoppingListFromPlan(scoped, recipes).categories).every((item) => item.sourceMealSlotIds.every((id) => visibleSlotIds.has(id))));
  assert.equal(plan.days[0].slots.length, 4);
});

test("individual meal overrides survive household changes and can return to household defaults", () => {
  const plan = applyHouseholdToPlan(planFor([recipes[0], recipes[0]], 2), household(2));
  const changed = updateSlotServings({ ...plan, status: "confirmed", confirmedAt: "2026-10-05" }, "slot-0", 5);
  assert.equal(changed.status, "draft");
  assert.equal(changed.confirmedAt, "2026-10-05");
  const next = applyHouseholdToPlan(changed, household(4));
  assert.deepEqual(next.days[0].slots.map((slot) => slot.servings), [5, 4]);
  const reset = updateSlotServings(next, "slot-0", 4, false);
  assert.equal(applyHouseholdToPlan(reset, household(2)).days[0].slots[0].servings, 2);
});

test("same recipe on different days/slots retains separate serving context in links", () => {
  const plan = updateSlotServings(planFor([recipes[0], recipes[0]], 2), "slot-1", 5);
  const slots = buildWeeklyPlanPreview(plan, recipes)[0].slots;
  assert.notEqual(slots[0].recipeHref, slots[1].recipeHref);
  assert.deepEqual(slots.map((slot) => slot.servings), [2, 5]);
  assert(slots.every((slot) => slot.recipeHref?.includes("planId=")));
});

test("plan API serving validation rejects invalid or duplicate slots", () => {
  const plan = planFor([recipes[0]]);
  assert(hasValidPlanServings(plan.days));
  for (const servings of [0, -1, 1.5, null, "3", NaN, Infinity]) {
    assert(!hasValidPlanServings([{ ...plan.days[0], slots: [{ ...plan.days[0].slots[0], servings }] }]));
  }
  assert(!hasValidPlanServings([{ ...plan.days[0], slots: [plan.days[0].slots[0], plan.days[0].slots[0]] }]));
  assert(!hasValidPlanServings(null));
});

test("new plans from different households cannot share a primary key", () => {
  const template = buildDefaultWeekTemplate("one", 2);
  const options = { planningStartMode: "today" as const, referenceDate: new Date("2026-10-05T12:00:00Z") };
  assert.notEqual(buildActivePlanFromTemplate(template, { ...options, householdId: "one" }).id, buildActivePlanFromTemplate(template, { ...options, householdId: "two" }).id);
});

test("existing checks migrate across aliases and kg/g without duplicate removed rows", () => {
  const catalog = [recipe("rice", [ingredient(1000, "Arroz", "g")])];
  const list = buildShoppingListFromPlan(planFor(catalog), catalog);
  const previous: ShoppingListState = { planId: list.planId, updatedAt: "", items: [{ itemKey: "carbs:Arroz:kg", checked: true, status: "needed", name: "Arroz", quantity: 1, unit: "kg" }] };
  const next = buildNextShoppingListState(previous, list);
  assert.equal(next.items.length, 1);
  assert.equal(next.items[0].itemKey, "arroz:g");
  assert.equal(next.items[0].checked, true);
  assert.equal(next.items[0].quantity, 1000);
});

test("increased quantities, mixed checks, and another plan do not stay checked", () => {
  const catalog = [recipe("onion", [ingredient(2)])];
  const list = buildShoppingListFromPlan(planFor(catalog), catalog);
  const previous: ShoppingListState = { planId: list.planId, updatedAt: "", items: [{ itemKey: "vegetables:Cebolla:ud", checked: true, status: "needed", name: "Cebolla", quantity: 1, unit: "ud" }] };
  assert.equal(buildNextShoppingListState(previous, list).items[0].checked, false);
  previous.items.push({ ...previous.items[0], itemKey: "vegetables:cebollas:unit", name: "cebollas", checked: false });
  assert.equal(buildNextShoppingListState(previous, list).items[0].checked, false);
  assert.equal(buildNextShoppingListState({ ...previous, planId: "another" }, list).items[0].checked, false);
});

test("a missing recipe cannot silently produce an incomplete shopping list", () => {
  assert.throws(() => buildShoppingListFromPlan(planFor([recipes[0]]), []), /Missing recipe/);
});

test("recipe detail shows scaled amounts while cooking keeps the steps without repeating ingredients", () => {
  const props = { recipe: recipes[0], requestedServings: 4, contextQuery: "?planId=plan-test&slotId=slot-test" };
  const detail = renderToStaticMarkup(createElement(RecipeDetailClient, props));
  const cooking = renderToStaticMarkup(createElement(CookingMode, props));
  assert(detail.includes("240 g"));
  assert(detail.includes("600 g"));
  assert(detail.includes("4 ud"));
  assert(!detail.includes("180 g"));
  assert(!detail.includes("Carlos"));
  assert(detail.includes("Ingredientes para 4 comensales"));
  assert(!cooking.includes("Ingredientes para"));
  assert(cooking.includes(recipes[0].steps[0].title));
  assert(cooking.includes("Pasos de la receta"));
  assert(detail.includes("/cook/avena-yogur-fruta?planId=plan-test&amp;slotId=slot-test"));
});

test("saving servings preserves inactive meal slots so preferences can be changed later", () => {
  const plan = buildActivePlanFromTemplate(buildDefaultWeekTemplate("household-test", 3), { householdId: "household-test", planningStartMode: "today" });
  const resolved = resolvePlanServings(plan, household(4, ["dinner"]));
  assert.equal(resolved.days[0].slots.length, 4);
  assert.equal(applyHouseholdToPlan(resolved, household(4, ["dinner"])).days[0].slots.length, 1);
  assert.equal(applyHouseholdToPlan(resolved, household(4, ["lunch", "dinner"])).days[0].slots.length, 2);
});

test("shopping screen shows whole-unit purchase and qualitative items without raw calculation noise", () => {
  const catalog = [recipe("avocado", [ingredient(2.6, "Aguacate"), ingredient(1, "Sal", "g", { amountType: "to_taste" })])];
  const list = buildShoppingListFromPlan(planFor(catalog), catalog);
  const markup = renderToStaticMarkup(createElement(ShoppingListClient, {
    categories: list.categories, onToggleItem: () => {}, onClearMarked: () => {},
  }));
  assert(markup.includes("3 unidades"));
  assert(!markup.includes("Necesario:"));
  assert(!markup.includes("2,6"));
  assert(markup.includes("Al gusto"));
  assert(!markup.includes("0 g"));
});

test("shopping suggestions simplify the reported quantities while retaining precise data", () => {
  const catalog = [recipe("purchase", [
    ingredient(633.3333333333334, "Carne picada", "g"),
    ingredient(966.6666666666666, "Pollo", "g"),
    ingredient(166.66666666666666, "Salsa de carne", "g"),
    ingredient(18.666666666666668, "Huevos", "ud"),
  ])];
  const items = itemsFor(catalog);
  const original = structuredClone(items);
  assert.equal(formatShoppingAmount(items.find((item) => item.name === "Carne picada")!), "≈ 650 g");
  assert.equal(formatShoppingAmount(items.find((item) => item.name === "Pollo")!), "≈ 1 kg");
  assert.equal(formatShoppingAmount(items.find((item) => item.name === "Salsa de carne")!), "≈ 170 g");
  assert.equal(formatShoppingAmount(items.find((item) => item.name === "Huevos")!), "19 unidades");
  assert.deepEqual(items, original);
  assert.equal(formatShoppingAmount({ quantity: 0.75, unit: "kg" }), "750 g");
  assert.equal(formatShoppingAmount({ quantity: 1000.0000000000001, unit: "ml" }), "1 l");
});

test("checked products remain visible once in their category after pending products", () => {
  const list = buildShoppingListFromPlan(planFor([recipe("a", [ingredient(1, "Marcado"), ingredient(2, "Pendiente")])]), [recipe("a", [ingredient(1, "Marcado"), ingredient(2, "Pendiente")])]);
  list.categories[0].items.find((item) => item.name === "Marcado")!.checked = true;
  const markup = renderToStaticMarkup(createElement(ShoppingListClient, {
    categories: list.categories, onToggleItem: () => {}, onClearMarked: () => {},
  }));
  assert.equal((markup.match(/>Marcado</g) ?? []).length, 1);
  assert.equal((markup.match(/type="checkbox"/g) ?? []).length, 2);
  assert(markup.indexOf(">Pendiente<") < markup.indexOf(">Marcado<"));
  assert(markup.includes('checked=""'));
  assert(!markup.includes("Productos que ya tienes controlados"));
  assert(!markup.includes(">Completados<"));
});

test("a fully checked category still exposes its checkboxes to undo purchases", () => {
  const catalog = [recipe("a", [ingredient(1, "Cebolla"), ingredient(2, "Aguacate")])];
  const list = buildShoppingListFromPlan(planFor(catalog), catalog);
  list.categories[0].items.forEach((item) => { item.checked = true; });
  const markup = renderToStaticMarkup(createElement(ShoppingListClient, {
    categories: list.categories, onToggleItem: () => {}, onClearMarked: () => {},
  }));
  assert.equal((markup.match(/type="checkbox"/g) ?? []).length, 2);
  assert.equal((markup.match(/checked=""/g) ?? []).length, 2);
  assert(markup.includes('aria-expanded="true"'));
  assert(markup.includes("2/2 marcados"));
  assert(!markup.includes(">Completados<"));
});

test("removed qualitative ingredients retain their display semantics", () => {
  const catalog = [recipe("salt", [ingredient(1, "Sal", "g", { amountType: "to_taste" })])];
  const list = buildShoppingListFromPlan(planFor(catalog), catalog);
  const before = buildNextShoppingListState(null, list);
  const after = buildNextShoppingListState(before, { planId: list.planId, categories: [] });
  assert.equal(after.items[0].status, "removed");
  assert.equal(after.items[0].amountType, "to_taste");
});
