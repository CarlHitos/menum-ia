import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { RecipeDetailClient } from "@/features/recipes/recipe-detail-client";
import { household, recipesById } from "@/lib/mocks";

type RecipePageProps = {
  params: Promise<{ recipeId: string }>;
};

export default async function RecipePage({ params }: RecipePageProps) {
  const { recipeId } = await params;
  const recipe = recipesById[recipeId];

  if (!recipe) {
    notFound();
  }

  return (
    <AppShell currentPath="/dashboard">
      <RecipeDetailClient recipe={recipe} household={household} />
    </AppShell>
  );
}
