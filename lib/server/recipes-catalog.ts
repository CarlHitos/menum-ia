import { isRecipeAvailable } from "@/lib/domain/recipe-availability";
import { getAllRecipes, getRecipeById, insertMissingRecipes, prepareRecipeCatalogSchema } from "@/lib/dal/recipes";
import { recipes as seedRecipes } from "@/lib/data/recipe-catalog";
import { expandedRecipes } from "@/lib/data/expanded-recipes";

let initialization: Promise<void> | undefined;
export function ensureRecipesCatalog() {
  initialization ??= (async () => {
    await prepareRecipeCatalogSchema();
    await insertMissingRecipes([...seedRecipes, ...expandedRecipes].filter((recipe) => isRecipeAvailable(recipe.id)));
  })().catch((error) => {
    initialization = undefined;
    throw error;
  });
  return initialization;
}

export async function getCatalogRecipes() {
  await ensureRecipesCatalog();
  return (await getAllRecipes()).filter((recipe) => isRecipeAvailable(recipe.id));
}

export async function getCatalogRecipeById(recipeId: string) {
  if (!isRecipeAvailable(recipeId)) return null;
  await ensureRecipesCatalog();
  return getRecipeById(recipeId);
}
