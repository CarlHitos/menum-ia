import { ingredientKey, normalizeUnit } from "@/lib/domain/ingredient-identity";
import type {
  ShoppingCategory,
  ShoppingItem,
  ShoppingList,
  ShoppingListState,
} from "@/lib/domain/types";

export function buildNextShoppingListState(
  previousState: ShoppingListState | null,
  derivedList: ShoppingList,
): ShoppingListState {
  const previousItems = previousState?.planId === derivedList.planId ? previousState.items : [];
  const matchedKeys = new Set<string>();
  const flattenedItems = flattenShoppingItems(derivedList.categories);
  const neededItems = flattenedItems.map((item) => {
    const matches = previousItems.filter((previous) =>
      previous.itemKey === item.id || item.legacyKeys?.includes(previous.itemKey) ||
      ingredientKey(previous.name, previous.unit) === item.id,
    );
    matches.forEach((previous) => matchedKeys.add(previous.itemKey));
    const previousQuantity = matches.reduce((sum, previous) =>
      sum + previous.quantity * normalizeUnit(previous.unit).factor, 0);
    // Preserve checks across aliases/unit upgrades, but ask the user to check
    // again when the planned purchase has increased or a product returns.
    const checked = matches.length > 0 && matches.every((previous) => previous.checked && previous.status === "needed") &&
      item.quantity <= previousQuantity + Number.EPSILON * Math.max(1, previousQuantity) * 16;
    return {
      itemKey: item.id,
      checked,
      status: "needed" as const,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      amountType: item.amountType,
      hasUnquantifiedAmount: item.hasUnquantifiedAmount,
    };
  });

  const removedItems =
    previousItems
      .filter((item) => !matchedKeys.has(item.itemKey))
      .map((item) => ({
        ...item,
        status: "removed" as const,
      }));

  return {
    planId: derivedList.planId,
    items: [...neededItems, ...removedItems],
    updatedAt: new Date().toISOString(),
  };
}

export function mergeShoppingListWithState(
  derivedList: ShoppingList,
  state: ShoppingListState | null,
) {
  const stateMap = new Map(state?.items.map((item) => [item.itemKey, item]) ?? []);

  const categories = derivedList.categories.map((category) => ({
    ...category,
    items: category.items.map((item) => ({
      ...item,
      checked: stateMap.get(item.id)?.checked ?? item.checked,
    })),
  }));

  const removedItems =
    state?.items.filter((item) => item.status === "removed").map((item) => item.itemKey) ?? [];

  return {
    categories,
    removedItemKeys: removedItems,
  };
}

export function getRemovedShoppingItems(
  state: ShoppingListState | null,
  previousKnownItems: ShoppingItem[],
) {
  const previousItemsMap = new Map(previousKnownItems.map((item) => [item.id, item]));

  return (
    state?.items
      .filter((item) => item.status === "removed")
      .map((item) => ({
        id: item.itemKey,
        name: previousItemsMap.get(item.itemKey)?.name ?? item.name,
        quantity: previousItemsMap.get(item.itemKey)?.quantity ?? item.quantity,
        unit: previousItemsMap.get(item.itemKey)?.unit ?? item.unit,
        amountType: item.amountType,
        hasUnquantifiedAmount: item.hasUnquantifiedAmount,
        checked: item.checked,
        sourceRecipeIds: [],
        sourceMealSlotIds: [],
      })) ?? []
  );
}

export function flattenShoppingItems(categories: ShoppingCategory[]) {
  return categories.flatMap((category) => category.items);
}
