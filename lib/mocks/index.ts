import { buildShoppingListFromPlan } from "@/lib/domain/shopping-list";
import {
  buildWeeklyPlanPreview,
  getWeeklyPlanSummary,
} from "@/lib/domain/weekly-plan-preview";
import { household } from "@/lib/mocks/household";
import { recipes, recipesById } from "@/lib/mocks/recipes";
import { weekTemplate } from "@/lib/mocks/week-template";
import { weeklyPlan } from "@/lib/mocks/weekly-plan";

export const householdSnapshot = {
  name: household.name,
  members: household.members.length,
  mode:
    household.planningPreferences.repeatMode === "repeat-base-week"
      ? "Semana base repetible"
      : "Semana variable",
  dietaryFocus: "Base comun con ajustes por persona",
};

export const weeklyPlanPreview = buildWeeklyPlanPreview(weeklyPlan, recipes);
export const weeklyPlanSummary = getWeeklyPlanSummary(weeklyPlan);

export const shoppingList = buildShoppingListFromPlan(weeklyPlan, recipes);

export { household, recipes, recipesById, weekTemplate, weeklyPlan };
