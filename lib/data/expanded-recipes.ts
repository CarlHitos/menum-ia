import catalog from "./expanded-recipes.json";
import type { Recipe } from "@/lib/domain/types";

// Curated domain data; the temporary input pack is never imported at runtime.
export const expandedRecipes = catalog as Recipe[];
