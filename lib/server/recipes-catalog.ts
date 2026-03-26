import { getAllRecipes, getRecipeById, getRecipeCount, upsertRecipes } from "@/lib/dal/recipes";
import { recipes as seedRecipes } from "@/lib/data/recipe-catalog";

export async function ensureRecipesCatalog() {
  const total = await getRecipeCount();

  if (total === 0) {
    await upsertRecipes(seedRecipes);
  }
}

export async function getCatalogRecipes() {
  await ensureRecipesCatalog();
  return getAllRecipes();
}

export async function getCatalogRecipeById(recipeId: string) {
  await ensureRecipesCatalog();
  return getRecipeById(recipeId);
}
