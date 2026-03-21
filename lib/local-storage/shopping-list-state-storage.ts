import type { ShoppingListState } from "@/lib/domain/types";

const STORAGE_PREFIX = "menumia:shopping-list-state:v1:";

function getStorageKey(planId: string, userId?: string) {
  return userId
    ? `${STORAGE_PREFIX}${userId}:${planId}`
    : `${STORAGE_PREFIX}${planId}`;
}

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

export function loadShoppingListState(planId: string, userId?: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(planId, userId));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return isValidShoppingListState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveShoppingListState(state: ShoppingListState, userId?: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getStorageKey(state.planId, userId),
      JSON.stringify(state),
    );
  } catch {
    // Ignore storage failures.
  }
}
