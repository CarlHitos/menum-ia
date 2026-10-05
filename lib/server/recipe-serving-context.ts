import { getWeeklyPlanByIdForHousehold } from "@/lib/dal/plans";
import { applyHouseholdToPlan, recipeContextQuery } from "@/lib/domain/plan-servings";
import type { Household } from "@/lib/domain/types";

export type RecipeSearchParams = { planId?: string | string[]; slotId?: string | string[] };

export async function getRecipeServingContext(recipeId: string, household: Household, params: RecipeSearchParams) {
  if (params.planId === undefined && params.slotId === undefined) {
    return { requestedServings: Math.max(1, household.members.length), query: "" };
  }
  if (typeof params.planId !== "string" || typeof params.slotId !== "string") return null;
  const storedPlan = await getWeeklyPlanByIdForHousehold(params.planId, household.id);
  if (!storedPlan) return null;
  const plan = applyHouseholdToPlan(storedPlan, household);
  const slot = plan.days.flatMap((day) => day.slots).find((slot) => slot.id === params.slotId && slot.recipeId === recipeId);
  if (!slot) return null;
  return { requestedServings: slot.servings, query: recipeContextQuery(plan.id, slot.id) };
}
