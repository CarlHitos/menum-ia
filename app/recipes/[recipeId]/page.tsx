import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { RecipeDetailClient } from "@/features/recipes/recipe-detail-client";
import { requireAuth } from "@/lib/auth/require-auth";
import { getHouseholdWithMembersByOwnerUserId } from "@/lib/dal/households";
import { buildHouseholdFromPersistence } from "@/lib/domain/household-mappers";
import { getCatalogRecipeById } from "@/lib/server/recipes-catalog";

type RecipePageProps = {
  params: Promise<{ recipeId: string }>;
};

export default async function RecipePage({ params }: RecipePageProps) {
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

  return (
    <AppShell currentPath="/dashboard">
      <RecipeDetailClient recipe={recipe} household={household} />
    </AppShell>
  );
}
