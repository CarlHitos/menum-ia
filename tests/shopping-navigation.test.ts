import assert from "node:assert/strict";
import test from "node:test";
import { completesShoppingCategory, getNextPendingShoppingCategory } from "../lib/ui/shopping-navigation";
import type { ShoppingCategory, ShoppingItem } from "../lib/domain/types";

function category(key: string, checks: boolean[]): ShoppingCategory {
  return { key, label: key, items: checks.map((checked, index): ShoppingItem => ({
    id: `${key}-${index}`, name: `${key}-${index}`, checked, quantity: 1, unit: "ud", sourceRecipeIds: [], sourceMealSlotIds: [],
  })) };
}

test("only checking the final pending product completes a category", () => {
  const group = category("fruit", [true, false]);
  assert.equal(completesShoppingCategory(group, "fruit-1"), true);
  assert.equal(completesShoppingCategory(group, "fruit-0"), false);
  assert.equal(completesShoppingCategory(group, "missing"), false);
  assert.equal(completesShoppingCategory(category("fruit", [false, false]), "fruit-1"), false);
  assert.equal(completesShoppingCategory(category("empty", []), "empty-0"), false);
});

test("advancing skips complete and empty categories", () => {
  const groups = [category("protein", [false]), category("legumes", [true]), category("empty", []), category("vegetables", [true, false])];
  assert.equal(getNextPendingShoppingCategory(groups, "protein"), "vegetables");
});

test("advancing wraps around to an earlier pending category", () => {
  const groups = [category("protein", [false]), category("legumes", [true]), category("fruit", [false])];
  assert.equal(getNextPendingShoppingCategory(groups, "fruit"), "protein");
});

test("finishing all products leaves no next category and never reopens the completed one", () => {
  assert.equal(getNextPendingShoppingCategory([category("only", [false])], "only"), null);
  assert.equal(getNextPendingShoppingCategory([category("done", [true]), category("last", [false])], "last"), null);
  assert.equal(getNextPendingShoppingCategory([], "missing"), null);
  assert.equal(getNextPendingShoppingCategory([category("fruit", [false])], "missing"), null);
});
