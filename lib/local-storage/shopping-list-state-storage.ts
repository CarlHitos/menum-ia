import type { ShoppingListState } from "@/lib/domain/types";

const STORAGE_PREFIX = "menumia:shopping-list-state:v1:";

function isValidShoppingListState(value: unknown): value is ShoppingListState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const state = value as Record<string, unknown>;

  return (
    typeof state.planId === "string" &&
    Array.isArray(state.items) &&
    typeof state.updatedAt === "string"
  );
}

export function loadShoppingListState(planId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${planId}`);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return isValidShoppingListState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveShoppingListState(state: ShoppingListState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      `${STORAGE_PREFIX}${state.planId}`,
      JSON.stringify(state),
    );
  } catch {
    // Ignore storage failures.
  }
}
