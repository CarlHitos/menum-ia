import type { Household, WeeklyPlan } from "@/lib/domain/types";
import { isValidServings } from "@/lib/domain/portioning";

export function resolvePlanServings(plan: WeeklyPlan, household: Household): WeeklyPlan {
  const servings = Math.max(1, household.members.length);
  return {
    ...plan,
    days: plan.days.map((day) => ({
      ...day,
      slots: day.slots.map((slot) => ({
        ...slot,
        servings: slot.servingsOverride && isValidServings(slot.servings) ? slot.servings : servings,
      })),
    })),
  };
}

export function applyHouseholdToPlan(plan: WeeklyPlan, household: Household): WeeklyPlan {
  const resolved = resolvePlanServings(plan, household);
  return {
    ...resolved,
    days: resolved.days.map((day) => ({
      ...day,
      slots: day.slots.filter((slot) => household.planningPreferences.mealsPerDay.includes(slot.mealType)),
    })),
  };
}

export function updateSlotServings(plan: WeeklyPlan, slotId: string, servings: number, override = true): WeeklyPlan {
  if (!isValidServings(servings)) throw new Error("Invalid servings");
  return {
    ...plan,
    status: "draft",
    updatedAt: new Date().toISOString(),
    days: plan.days.map((day) => ({
      ...day,
      slots: day.slots.map((slot) => slot.id === slotId
        ? { ...slot, servings, servingsOverride: override } : slot),
    })),
  };
}

export function recipeContextQuery(planId: string, slotId: string) {
  return `?${new URLSearchParams({ planId, slotId }).toString()}`;
}

export function hasValidPlanServings(days: unknown): boolean {
  if (!Array.isArray(days) || days.length === 0) return false;
  const slotIds = new Set<string>();
  return days.every((day) => day && typeof day === "object" && typeof day.dayKey === "string" &&
    Array.isArray(day.slots) && day.slots.every((slot: Record<string, unknown>) => {
      if (!slot || typeof slot !== "object" || typeof slot.id !== "string" || slotIds.has(slot.id) ||
        typeof slot.recipeId !== "string" || typeof slot.dayKey !== "string" ||
        !["breakfast", "lunch", "dinner", "snack"].includes(String(slot.mealType)) ||
        !Array.isArray(slot.tags) || !isValidServings(slot.servings) ||
        (slot.servingsOverride !== undefined && typeof slot.servingsOverride !== "boolean")) return false;
      slotIds.add(slot.id);
      return true;
    }));
}
