import type { MealSlot, PlannedDay, WeeklyPlan } from "@/lib/domain/types";

export function getMealSlotById(plan: WeeklyPlan, slotId: string) {
  return plan.days.flatMap((day) => day.slots).find((slot) => slot.id === slotId);
}

export function getSlotsByMealType(plan: WeeklyPlan, mealType: MealSlot["mealType"]) {
  return plan.days.flatMap((day) => day.slots).filter((slot) => slot.mealType === mealType);
}

export function getDayDinnerSlots(day: PlannedDay) {
  return day.slots.filter((slot) => slot.mealType === "dinner");
}
