import { getAllRecipes, getRecipeById, insertMissingRecipes, prepareRecipeCatalogSchema } from "@/lib/dal/recipes";
import { recipes as seedRecipes } from "@/lib/data/recipe-catalog";
import { expandedRecipes } from "@/lib/data/expanded-recipes";

let initialization: Promise<void> | undefined;
export function ensureRecipesCatalog() {
  initialization ??= (async () => {
    await prepareRecipeCatalogSchema();
    await insertMissingRecipes([...seedRecipes, ...expandedRecipes]);
  })().catch((error) => {
    initialization = undefined;
    throw error;
  });
  return initialization;
}

export async function getCatalogRecipes() {
  await ensureRecipesCatalog();
  return getAllRecipes();
}

export async function getCatalogRecipeById(recipeId: string) {
  await ensureRecipesCatalog();
  return getRecipeById(recipeId);
}
