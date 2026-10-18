import { isRecipeAvailable } from "./recipe-availability";
import type { MealType, Recipe, RecipeKind, RecipeSeason } from "./types";

export const recipeKindLabels: Record<RecipeKind, string> = {
  meal: "Platos", bowl: "Boles y ensaladas", protein: "Proteínas", side: "Guarniciones",
  sharing: "Para compartir", breakfast: "Desayunos", sauce: "Salsas", dessert: "Postres",
};
export const recipeSeasonLabels: Record<RecipeSeason, string> = {
  all_year: "Todo el año", spring: "Primavera", summer: "Verano", autumn: "Otoño", winter: "Invierno",
};
export function getRecipeMetadata(recipe: Recipe) {
  const metadata = recipe.catalogMetadata ?? {
    kind: recipe.category === "breakfast" ? "breakfast" as const : recipe.category === "snack" || recipe.category === "mid-morning" ? "dessert" as const : "meal" as const,
    season: "all_year" as const,
    mealTypes: [recipe.category],
  };
  // Shared eligibility applies equally to imported JSON and persisted recipes.
  return metadata.mealTypes.includes("snack") && !metadata.mealTypes.includes("mid-morning")
    ? { ...metadata, mealTypes: [...metadata.mealTypes, "mid-morning" as const] }
    : metadata;
}
export function canPlanRecipe(recipe: Recipe, mealType: MealType) {
  return getRecipeMetadata(recipe).mealTypes.includes(mealType);
}
function searchable(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
export type RecipeFilters = { query?: string; kind?: RecipeKind | ""; season?: RecipeSeason | ""; maxMinutes?: number; difficulty?: Recipe["difficulty"] | ""; mealType?: MealType };
export function filterRecipes(recipes: Recipe[], filters: RecipeFilters) {
  const terms = searchable(filters.query ?? "").trim().split(/\s+/).filter(Boolean);
  return recipes.filter((recipe) => {
    const metadata = getRecipeMetadata(recipe);
    const text = searchable([recipe.title, ...recipe.ingredients.map((ingredient) => ingredient.name)].join(" "));
    return isRecipeAvailable(recipe.id) && terms.every((term) => text.includes(term))
      && (!filters.kind || metadata.kind === filters.kind)
      && (!filters.season || metadata.season === "all_year" || metadata.season === filters.season)
      && (!filters.difficulty || recipe.difficulty === filters.difficulty)
      && (!filters.maxMinutes || recipe.durationMinutes <= filters.maxMinutes)
      && (!filters.mealType || canPlanRecipe(recipe, filters.mealType));
  });
}
