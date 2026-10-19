import { applyHouseholdToPlan } from "@/lib/domain/plan-servings";
import { buildShoppingListFromPlan } from "@/lib/domain/shopping-list";
import { buildNextShoppingListState, flattenShoppingItems, mergeShoppingListWithState } from "@/lib/domain/shopping-list-state";
import { buildWeeklyPlanPreview } from "@/lib/domain/weekly-plan-preview";
import { getPlanRangeLabel } from "@/lib/domain/weekly-plan-runtime";
import type { Household, Recipe, ShoppingListState, WeeklyPlan } from "@/lib/domain/types";

export function buildHomeSummary(
  household: Household,
  storedPlan: WeeklyPlan | null,
  recipes: Recipe[],
  shoppingState: ShoppingListState | null,
) {
  const plan = storedPlan ? applyHouseholdToPlan(storedPlan, household) : null;
  const list = plan ? buildShoppingListFromPlan(plan, recipes) : null;
  const items = list
    ? flattenShoppingItems(mergeShoppingListWithState(list, buildNextShoppingListState(shoppingState, list)).categories)
    : [];
  const checked = items.filter((item) => item.checked).length;
  const days = plan ? buildWeeklyPlanPreview(plan, recipes).map((day, index) => {
    const date = new Date(`${plan.rangeStart}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + index);
    return { ...day, date: date.toISOString().slice(0, 10) };
  }) : [];

  return {
    planId: plan?.id ?? null,
    status: plan?.status ?? null,
    rangeLabel: plan ? getPlanRangeLabel(plan) : "",
    days,
    shopping: {
      total: items.length,
      checked,
      percentage: items.length ? Math.round(checked / items.length * 100) : 0,
    },
  };
}

export type HomeSummaryData = ReturnType<typeof buildHomeSummary>;

export function findHomeDay(days: HomeSummaryData["days"], localDate: string) {
  return days.find((day) => day.date === localDate) ?? null;
}
