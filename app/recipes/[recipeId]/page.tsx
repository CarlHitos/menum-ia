import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
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
      <PageHeader
        eyebrow="Receta"
        title={recipe.title}
        description={recipe.description}
        action={
          <Link
            href={`/cook/${recipe.id}`}
            className="rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Cocinar
          </Link>
        }
      />

      <SectionCard className="mb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[rgba(255,255,255,0.06)] p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Duracion
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--color-paper)]">
              {recipe.durationMinutes} min
            </p>
          </div>
          <div className="rounded-2xl bg-[rgba(255,255,255,0.06)] p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Base hogar
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--color-paper)]">
              {recipe.baseServings} personas
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {recipe.quickDinner ? (
            <span className="rounded-full bg-[rgba(252,163,17,0.16)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
              Anti-delivery
            </span>
          ) : null}
          {recipe.batchCookingNotes ? (
            <span className="rounded-full bg-[rgba(135,214,141,0.12)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-success)]">
              Batch friendly
            </span>
          ) : null}
          {recipe.leftoverNotes ? (
            <span className="rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-paper)]">
              Reutiliza sobras
            </span>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Ingredientes base
        </p>
        <div className="mt-3 space-y-2">
          {recipe.ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="flex items-center justify-between rounded-2xl bg-[rgba(255,255,255,0.06)] px-3 py-3 text-sm"
            >
              <span className="text-[var(--color-paper)]">{ingredient.name}</span>
              <span className="text-[var(--color-muted)]">
                {ingredient.quantity} {ingredient.unit}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Ajustes por persona
        </p>
        <div className="mt-3 space-y-3">
          {household.members.map((member) => {
            const memberAdjustments = recipe.portionAdjustments.filter(
              (adjustment) => adjustment.memberId === member.id,
            );

            return (
              <div
                key={member.id}
                className="rounded-2xl bg-[rgba(255,255,255,0.06)] px-4 py-3"
              >
                <p className="text-sm font-semibold text-[var(--color-paper)]">
                  {member.name}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {member.goal}
                </p>
                <div className="mt-2 space-y-1 text-sm text-[var(--color-muted)]">
                  {memberAdjustments.length ? (
                    memberAdjustments.map((adjustment) => {
                      const ingredient = recipe.ingredients.find(
                        (item) => item.id === adjustment.ingredientId,
                      );

                      return (
                        <p key={adjustment.id}>
                          {ingredient?.name}: {adjustment.deltaQuantity > 0 ? "+" : ""}
                          {adjustment.deltaQuantity} {adjustment.unit}
                        </p>
                      );
                    })
                  ) : (
                    <p>Misma base sin cambios.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Logica de planificacion
        </p>
        <div className="mt-3 space-y-3 text-sm text-[var(--color-muted)]">
          {recipe.batchCookingNotes ? <p>{recipe.batchCookingNotes}</p> : null}
          {recipe.leftoverNotes ? <p>{recipe.leftoverNotes}</p> : null}
          <p>
            Esta receta usa una base comun para el hogar y mantiene la adaptacion
            en raciones, no en menus separados.
          </p>
        </div>
      </SectionCard>

      <SectionCard className="bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(252,163,17,0.14))]">
        <p className="text-sm leading-6 text-[var(--color-muted)]">
          Cuando estes listo, entra en el modo cocinar para seguir los pasos,
          marcar progreso y usar timer solo si te hace falta.
        </p>
        <Link
          href={`/cook/${recipe.id}`}
          className="mt-4 inline-flex rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-slate-950"
        >
          Cocinar
        </Link>
      </SectionCard>
    </AppShell>
  );
}
