import { buildShoppingListFromPlan } from "@/lib/domain/shopping-list";
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

export const weeklyPlanPreview = weeklyPlan.days.map((day) => ({
  dayKey: day.dayKey,
  label: day.label,
  slots: ["lunch", "dinner"].map((mealType) => {
    const slot = day.slots.find((item) => item.mealType === mealType);

    if (!slot) {
      return {
        mealType,
        status: "empty" as const,
        title: "Sin plan todavia",
        description: "Hueco libre para editar esta semana base.",
      };
    }

    const recipe = recipesById[slot.recipeId];
    const emphasis = slot.tags.includes("quick-dinner")
      ? "Anti-delivery"
      : slot.tags.includes("uses-leftovers")
        ? "Aprovecha sobras"
        : slot.tags.includes("batch-friendly")
          ? "Batch cooking"
          : "Base comun";

    return {
      mealType,
      status: "planned" as const,
      recipeId: recipe.id,
      title: recipe.title,
      minutes: recipe.durationMinutes,
      description: emphasis,
      tags: slot.tags,
    };
  }),
}));

export const shoppingList = buildShoppingListFromPlan(weeklyPlan, recipes);

export { household, recipes, recipesById, weekTemplate, weeklyPlan };
