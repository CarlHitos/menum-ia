import type { WeekTemplate, WeeklyPlan } from "./types";

// Keep the stored recipe for a future leftovers feature, without offering it now.
const replacementRecipeIds: Record<string, string> = {
  "cena-aprovechamiento": "tortilla-calabacin",
};
export function isRecipeAvailable(recipeId: string) {
  return !Object.hasOwn(replacementRecipeIds, recipeId);
}

function replaceUnavailableRecipes<T extends WeekTemplate | WeeklyPlan>(model: T): T {
  const replacedSlotIds = new Set(model.days.flatMap((day) => day.slots)
    .filter((slot) => !isRecipeAvailable(slot.recipeId)).map((slot) => slot.id));
  if (replacedSlotIds.size === 0) return model;
  return {
    ...model,
    days: model.days.map((day) => ({
      ...day,
      slots: day.slots.map((slot) => replacedSlotIds.has(slot.id) ? {
        ...slot,
        recipeId: replacementRecipeIds[slot.recipeId],
        tags: ["quick-dinner"],
      } : slot),
    })),
    leftoverFlows: model.leftoverFlows.filter((flow) => !replacedSlotIds.has(flow.sourceMealSlotId) && !replacedSlotIds.has(flow.targetMealSlotId)),
    batchBlocks: model.batchBlocks.map((block) => ({
      ...block,
      feedsMealSlotIds: block.feedsMealSlotIds.filter((id) => !replacedSlotIds.has(id)),
    })),
  };
}
export function normalizeTemplateRecipes(template: WeekTemplate): WeekTemplate {
  return replaceUnavailableRecipes(template);
}
export function normalizePlanRecipes(plan: WeeklyPlan): WeeklyPlan {
  const normalized = replaceUnavailableRecipes(plan);
  // An automatic recipe change needs review, including previously confirmed weeks.
  return normalized === plan ? plan : { ...normalized, status: "draft" };
}
