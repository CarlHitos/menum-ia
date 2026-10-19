import type { ShoppingCategory } from "@/lib/domain/types";

export function completesShoppingCategory(category: ShoppingCategory, itemId: string) {
  const item = category.items.find((item) => item.id === itemId);
  return Boolean(item && !item.checked && category.items.every((entry) => entry.id === itemId || entry.checked));
}

export function getNextPendingShoppingCategory(categories: ShoppingCategory[], completedKey: string) {
  const index = categories.findIndex((category) => category.key === completedKey);
  if (index < 0) return null;
  for (let offset = 1; offset < categories.length; offset++) {
    const category = categories[(index + offset) % categories.length];
    if (category.items.some((item) => !item.checked)) return category.key;
  }
  return null;
}
