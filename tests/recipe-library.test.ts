import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expandedRecipes } from "../lib/data/expanded-recipes";
import { recipes } from "../lib/data/recipe-catalog";
import { canPlanRecipe, filterRecipes, getRecipeMetadata } from "../lib/domain/recipe-library";
import { scaleRecipeIngredients } from "../lib/domain/portioning";
import { RecipeBrowser } from "../features/recipes/recipe-browser";
import { buildShoppingListFromPlan } from "../lib/domain/shopping-list";
import { buildDefaultWeekTemplate } from "../lib/domain/default-week-template";
import { buildActivePlanFromTemplate } from "../lib/domain/weekly-plan-runtime";

const catalog = [...recipes, ...expandedRecipes];
test("100 unique recipes preserve the original catalogue and all seven new families", () => {
  assert.equal(recipes.length, 33);
  assert.equal(expandedRecipes.length, 67);
  assert.equal(new Set(catalog.map((recipe) => recipe.id)).size, 100);
  const counts: Record<string, number> = {};
  for (const recipe of expandedRecipes) {
    const kind = getRecipeMetadata(recipe).kind;
    counts[kind] = (counts[kind] ?? 0) + 1;
    assert.ok(recipe.baseServings > 0 && Number.isInteger(recipe.baseServings));
    assert.ok(recipe.steps.length > 0);
    assert.equal(new Set(recipe.ingredients.map((item) => item.id)).size, recipe.ingredients.length);
    for (const item of recipe.ingredients) {
      assert.ok(Number.isFinite(item.quantity) && item.quantity >= 0);
      assert.ok(["g", "ml", "ud", "diente", "hoja", "rebanada"].includes(item.unit));
      assert.ok(item.amountType);
      assert.ok(!item.name.includes(" o "));
    }
  }
  assert.deepEqual(counts, { sharing: 9, protein: 7, bowl: 10, side: 17, breakfast: 12, sauce: 6, dessert: 6 });
  assert.doesNotMatch(JSON.stringify(expandedRecipes), /honest|hg-|ben's|latin lover|wild mediterranean|tres bowls|650 g|12-15 bolitas/i);
});
test("every new recipe scales precisely for 1, 2, 4 and 7 people, including qualitative ingredients", () => {
  for (const recipe of expandedRecipes) {
    for (const servings of [1, 2, 4, 7]) {
      const scaled = scaleRecipeIngredients(recipe, servings);
      scaled.forEach((item, index) => {
        const ingredient = recipe.ingredients[index];
        assert.equal(item.recipeAmount, ingredient.amountType === "exact" ? ingredient.quantity * (servings / recipe.baseServings) : null);
      });
    }
  }
});
test("search ignores accents and finds ingredients; filters combine and seasons include year-round dishes", () => {
  assert.ok(filterRecipes(catalog, { query: "SALMON miso" }).some((recipe) => recipe.title.startsWith("Salmón")));
  assert.ok(filterRecipes(catalog, { query: "pistacho", kind: "breakfast", maxMinutes: 35 }).length > 0);
  const summer = filterRecipes(catalog, { season: "summer" });
  assert.ok(summer.some((recipe) => getRecipeMetadata(recipe).season === "all_year"));
  assert.ok(summer.some((recipe) => getRecipeMetadata(recipe).season === "summer"));
  assert.ok(summer.every((recipe) => ["summer", "all_year"].includes(getRecipeMetadata(recipe).season)));
  assert.equal(filterRecipes(catalog, { query: "zzzzzzzz" }).length, 0);
});
test("components never replace full meals; bowls work for lunch and dinner and original eligibility is preserved", () => {
  for (const recipe of expandedRecipes) {
    const kind = getRecipeMetadata(recipe).kind;
    if (["side", "sharing", "protein", "sauce"].includes(kind)) {
      assert.equal(canPlanRecipe(recipe, "lunch"), false);
      assert.equal(canPlanRecipe(recipe, "dinner"), false);
    }
    if (kind === "bowl") {
      assert.equal(canPlanRecipe(recipe, "lunch"), true);
      assert.equal(canPlanRecipe(recipe, "dinner"), true);
    }
  }
  for (const recipe of recipes) assert.equal(canPlanRecipe(recipe, recipe.category), true);
});
test("new recipes feed real weekly quantities and consolidate shared ingredients before purchase rounding", () => {
  const selected = expandedRecipes.filter((recipe) => recipe.title.startsWith("Bol de quinoa"));
  assert.equal(selected.length, 2);
  const template = buildDefaultWeekTemplate("test", 4);
  const plan = buildActivePlanFromTemplate(template, { householdId: "test", planningStartMode: "today" });
  plan.days = [{ dayKey: "monday", label: "Lun", slots: selected.map((recipe, index) => ({ id: `slot-${index}`, dayKey: "monday", mealType: "lunch", recipeId: recipe.id, servings: 4, tags: [] })) }];
  const items = buildShoppingListFromPlan(plan, catalog).categories.flatMap((category) => category.items);
  const quinoa = items.filter((item) => item.name === "quinoa cocida");
  assert.equal(quinoa.length, 1);
  const expected = selected.reduce((total, recipe) => total + recipe.ingredients.find((item) => item.name === "quinoa cocida")!.quantity * 4 / recipe.baseServings, 0);
  assert.ok(Math.abs(quinoa[0].totalNeeded! - expected) < 1e-9);
  assert.equal(quinoa[0].sourceRecipeIds.length, 2);
});
test("mobile library and weekly selector render accessible search, filters and eligible recipes", () => {
  const html = renderToStaticMarkup(createElement(RecipeBrowser, { recipes: catalog }));
  assert.match(html, /type="search"/);
  assert.match(html, /99 recetas/);
  assert.match(html, /Ver más recetas/);
  assert.match(html, /href="\/recipes\//);
  const selector = renderToStaticMarkup(createElement(RecipeBrowser, { recipes: catalog, mealType: "dinner", onSelect: () => {} }));
  assert.doesNotMatch(selector, /Crema de tahini al limón/);
  assert.match(selector, /Usar en esta comida/);
});
