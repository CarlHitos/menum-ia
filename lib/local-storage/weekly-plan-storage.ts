import type { WeeklyPlan } from "@/lib/domain/types";
import { normalizeWeeklyPlan } from "@/lib/domain/weekly-plan-runtime";

const STORAGE_KEY_V3 = "menumia:active-week:v3";
const STORAGE_KEY_V2 = "menumia:weekly-plan:v2";
const STORAGE_KEY_V1 = "menumia:weekly-plan:v1";

function getStorageKey(baseKey: string, userId?: string) {
  return userId ? `${baseKey}:${userId}` : baseKey;
}

function isValidWeeklyPlan(value: unknown): value is WeeklyPlan {
  if (!value || typeof value !== "object") {
    return false;
  }

  const plan = value as Record<string, unknown>;

  return (
    typeof plan.id === "string" &&
    typeof plan.householdId === "string" &&
    typeof plan.weekStart === "string" &&
    typeof plan.status === "string" &&
    typeof plan.planningStartMode === "string" &&
    typeof plan.rangeStart === "string" &&
    typeof plan.rangeEnd === "string" &&
    Array.isArray(plan.days) &&
    Array.isArray(plan.batchBlocks) &&
    Array.isArray(plan.leftoverFlows) &&
    typeof plan.updatedAt === "string"
  );
}

export function cloneWeeklyPlan(plan: WeeklyPlan): WeeklyPlan {
  return JSON.parse(JSON.stringify(plan)) as WeeklyPlan;
}

export function loadActiveWeeklyPlan(userId?: string): WeeklyPlan | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const currentRaw = window.localStorage.getItem(
      getStorageKey(STORAGE_KEY_V3, userId),
    );

    if (currentRaw) {
      const parsed = JSON.parse(currentRaw);
      return isValidWeeklyPlan(parsed) ? normalizeWeeklyPlan(parsed) : null;
    }

    const legacyRaw =
      window.localStorage.getItem(getStorageKey(STORAGE_KEY_V2, userId)) ??
      window.localStorage.getItem(getStorageKey(STORAGE_KEY_V1, userId));

    if (!legacyRaw) {
      return null;
    }

    const parsed = JSON.parse(legacyRaw);

    if (!isValidWeeklyPlan(parsed)) {
      return null;
    }

    const migrated = normalizeWeeklyPlan(parsed);
    saveActiveWeeklyPlan(migrated, userId);
    return migrated;
  } catch {
    return null;
  }
}

export function saveActiveWeeklyPlan(plan: WeeklyPlan, userId?: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getStorageKey(STORAGE_KEY_V3, userId),
      JSON.stringify(normalizeWeeklyPlan(plan)),
    );
  } catch {
    // Ignore storage failures and keep local state working.
  }
}

export function clearActiveWeeklyPlan(userId?: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(getStorageKey(STORAGE_KEY_V3, userId));
    window.localStorage.removeItem(getStorageKey(STORAGE_KEY_V2, userId));
    window.localStorage.removeItem(getStorageKey(STORAGE_KEY_V1, userId));
  } catch {
    // Ignore storage failures.
  }
}

export const loadWeeklyPlanDraft = loadActiveWeeklyPlan;
export const saveWeeklyPlanDraft = saveActiveWeeklyPlan;
export const clearWeeklyPlanDraft = clearActiveWeeklyPlan;
