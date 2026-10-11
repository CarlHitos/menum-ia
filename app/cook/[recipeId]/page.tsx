import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/ui/section-card";
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
          <Link
            href={`/recipes/${recipe.id}${context.query}`}
            className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs font-semibold text-[var(--color-paper)] transition hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
          >
            Receta
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[rgba(255,255,255,0.06)] p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Duracion
            </p>
            <p className="mt-1 text-base font-semibold text-[var(--color-paper)]">
              {recipe.durationMinutes} min
            </p>
          </div>
          <div className="rounded-2xl bg-[rgba(255,255,255,0.06)] p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Raciones
            </p>
            <p className="mt-1 text-base font-semibold text-[var(--color-paper)]">
              {context.requestedServings} {context.requestedServings === 1 ? "persona" : "personas"}
            </p>
          </div>
        </div>
      </SectionCard>

      <CookingMode recipe={recipe} requestedServings={context.requestedServings} contextQuery={context.query} />
    </AppShell>
  );
}
