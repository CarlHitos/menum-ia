import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { RecipeDetailClient } from "@/features/recipes/recipe-detail-client";
import { requireAuth } from "@/lib/auth/require-auth";
import { getHouseholdWithMembersByOwnerUserId } from "@/lib/dal/households";
import { buildHouseholdFromPersistence } from "@/lib/domain/household-mappers";
import { getCatalogRecipeById } from "@/lib/server/recipes-catalog";
import { getRecipeServingContext, type RecipeSearchParams } from "@/lib/server/recipe-serving-context";

type RecipePageProps = {
  params: Promise<{ recipeId: string }>;
  searchParams: Promise<RecipeSearchParams>;
};

export default async function RecipePage({ params, searchParams }: RecipePageProps) {
  const session = await requireAuth("/dashboard");
  const persistedHousehold = await getHouseholdWithMembersByOwnerUserId(
    session.user.id,
  );
  const { recipeId } = await params;
  const recipe = await getCatalogRecipeById(recipeId);

  if (!recipe || !persistedHousehold) {
    notFound();
  }

  const household = buildHouseholdFromPersistence(
    persistedHousehold.household,
    persistedHousehold.members,
  );
  const context = await getRecipeServingContext(recipeId, household, await searchParams);
  if (!context) notFound();

  return (
    <AppShell currentPath="/dashboard">
      <RecipeDetailClient recipe={recipe} requestedServings={context.requestedServings} contextQuery={context.query} />
    </AppShell>
  );
}
