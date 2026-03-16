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
  const previousMap = new Map(previousState?.items.map((item) => [item.itemKey, item]) ?? []);
  const nextKeys = new Set(
    derivedList.categories.flatMap((category) => category.items.map((item) => item.id)),
  );

  const flattenedItems = flattenShoppingItems(derivedList.categories);

  const neededItems = Array.from(nextKeys).map((itemKey) => {
    const item = flattenedItems.find((entry) => entry.id === itemKey);

    if (!item) {
      throw new Error(`Missing shopping item for key ${itemKey}`);
    }

    return {
      itemKey,
      checked: previousMap.get(itemKey)?.checked ?? false,
      status: "needed" as const,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
    };
  });

  const removedItems =
    previousState?.items
      .filter((item) => !nextKeys.has(item.itemKey))
      .map((item) => ({
        ...item,
        status: "removed" as const,
      })) ?? [];

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
        checked: item.checked,
        sourceRecipeIds: [],
        sourceMealSlotIds: [],
      })) ?? []
  );
}

export function flattenShoppingItems(categories: ShoppingCategory[]) {
  return categories.flatMap((category) => category.items);
}
