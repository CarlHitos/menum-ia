import { redirect } from "next/navigation";
import { getHouseholdWithMembersByOwnerUserId } from "@/lib/dal/households";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { RecipeBrowser } from "@/features/recipes/recipe-browser";
import { requireAuth } from "@/lib/auth/require-auth";
import { getCatalogRecipes } from "@/lib/server/recipes-catalog";

export default async function RecipesPage() {
  const session = await requireAuth("/recipes");
  if (!await getHouseholdWithMembersByOwnerUserId(session.user.id)) redirect("/onboarding");
  const recipes = await getCatalogRecipes();
  return <AppShell currentPath="/recipes">
    <PageHeader eyebrow="" title="Biblioteca de recetas" description="Ideas para tus comidas, desayunos y preparaciones. Encuentra recetas por sus ingredientes y temporada." />
    <RecipeBrowser recipes={recipes} />
  </AppShell>;
}
