import { asc, count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { recipes as recipesTable } from "@/db/schema";
import { normalizeRecipeForServings } from "@/lib/domain/recipe-compatibility";
import type { Recipe } from "@/lib/domain/types";

type PersistedRecipeRecord = typeof recipesTable.$inferSelect;

export async function getAllRecipes() {
  const rows = await db.select().from(recipesTable).orderBy(
    asc(recipesTable.category),
    asc(recipesTable.title),
  );

  return rows.map(mapRecipe);
}

export async function getRecipeById(recipeId: string) {
  const [recipe] = await db
    .select()
    .from(recipesTable)
    .where(eq(recipesTable.id, recipeId));

  return recipe ? mapRecipe(recipe) : null;
}

export async function getRecipeCount() {
  const [result] = await db.select({ value: count() }).from(recipesTable);
  return result?.value ?? 0;
}

export async function upsertRecipes(recipes: Recipe[]) {
  if (recipes.length === 0) {
    return [];
  }

  return db
    .insert(recipesTable)
    .values(
      recipes.map((recipe) => ({
        catalogMetadata: recipe.catalogMetadata ?? null,
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        durationMinutes: recipe.durationMinutes,
        difficulty: recipe.difficulty,
        baseServings: recipe.baseServings,
        utensils: recipe.utensils,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        substitutions: recipe.substitutions,
        portionAdjustments: recipe.portionAdjustments,
        batchCookingNotes: recipe.batchCookingNotes ?? null,
        leftoverNotes: recipe.leftoverNotes ?? null,
        quickDinner: recipe.quickDinner ?? null,
        baseYield: recipe.baseYield ?? null,
      })),
    )
    .onConflictDoUpdate({
      target: recipesTable.id,
      set: {
        catalogMetadata: dbExcluded("catalog_metadata"),
        title: dbExcluded("title"),
        description: dbExcluded("description"),
        category: dbExcluded("category"),
        durationMinutes: dbExcluded("duration_minutes"),
        difficulty: dbExcluded("difficulty"),
        baseServings: dbExcluded("base_servings"),
        utensils: dbExcluded("utensils"),
        ingredients: dbExcluded("ingredients"),
        steps: dbExcluded("steps"),
        substitutions: dbExcluded("substitutions"),
        portionAdjustments: dbExcluded("portion_adjustments"),
        batchCookingNotes: dbExcluded("batch_cooking_notes"),
        leftoverNotes: dbExcluded("leftover_notes"),
        quickDinner: dbExcluded("quick_dinner"),
        baseYield: dbExcluded("base_yield"),
        updatedAt: new Date(),
      },
    })
    .returning();
}

function mapRecipe(record: PersistedRecipeRecord): Recipe {
  return normalizeRecipeForServings({
    catalogMetadata: record.catalogMetadata ?? undefined,
    id: record.id,
    title: record.title,
    description: record.description,
    category: record.category as Recipe["category"],
    durationMinutes: record.durationMinutes,
    difficulty: record.difficulty as Recipe["difficulty"],
    baseServings: record.baseServings,
    utensils: record.utensils,
    ingredients: record.ingredients as Recipe["ingredients"],
    steps: record.steps as Recipe["steps"],
    substitutions: record.substitutions,
    portionAdjustments: record.portionAdjustments as Recipe["portionAdjustments"],
    batchCookingNotes: record.batchCookingNotes ?? undefined,
    leftoverNotes: record.leftoverNotes ?? undefined,
    quickDinner: record.quickDinner ?? undefined,
    baseYield: (record.baseYield as Recipe["baseYield"]) ?? undefined,
  });
}

function dbExcluded(column: string) {
  return sql.raw(`excluded.${column}`);
}

// Additive MVP migration: existing deployments can still read their original columns.
export async function prepareRecipeCatalogSchema() {
  await db.execute(sql`ALTER TABLE recipes ADD COLUMN IF NOT EXISTS catalog_metadata jsonb`);
}

export async function insertMissingRecipes(catalog: Recipe[]) {
  const existing = new Set((await db.select({ id: recipesTable.id }).from(recipesTable)).map((row) => row.id));
  const missing = catalog.filter((recipe) => !existing.has(recipe.id));
  const inserted: string[] = [];
  for (let offset = 0; offset < missing.length; offset += 20) {
    const rows = await db.insert(recipesTable).values(missing.slice(offset, offset + 20).map((recipe) => ({
      ...recipe,
      catalogMetadata: recipe.catalogMetadata ?? null,
    }))).onConflictDoNothing({ target: recipesTable.id }).returning({ id: recipesTable.id });
    inserted.push(...rows.map((row) => row.id));
  }
  return inserted;
}
