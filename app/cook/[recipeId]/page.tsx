import { RecipeBackLink } from "@/features/recipes/recipe-back-link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/ui/section-card";
import { StatPill } from "@/components/ui/stat-pill";
import { CookingMode } from "@/features/cooking/cooking-mode";
import { requireAuth } from "@/lib/auth/require-auth";
import { getHouseholdWithMembersByOwnerUserId } from "@/lib/dal/households";
import { buildHouseholdFromPersistence } from "@/lib/domain/household-mappers";
import { getCatalogRecipeById } from "@/lib/server/recipes-catalog";
import { getRecipeServingContext, type RecipeSearchParams } from "@/lib/server/recipe-serving-context";

type CookPageProps = {
  params: Promise<{ recipeId: string }>;
  searchParams: Promise<RecipeSearchParams>;
};

export default async function CookPage({ params, searchParams }: CookPageProps) {
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
      <SectionCard className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
              Modo cocinar
            </p>
            <h1 className="mt-2 text-xl font-semibold text-[var(--color-paper)]">
              {recipe.title}
            </h1>
          </div>
          <RecipeBackLink
            href={`/recipes/${recipe.id}${context.query}`}
            label="Salir"
            close
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <StatPill label="Duración" value={String(recipe.durationMinutes)} suffix="min" />
          <StatPill
            label="Raciones"
            value={String(context.requestedServings)}
            suffix={context.requestedServings === 1 ? "persona" : "personas"}
          />
        </div>
      </SectionCard>

      <CookingMode recipe={recipe} requestedServings={context.requestedServings} contextQuery={context.query} />
    </AppShell>
  );
}
