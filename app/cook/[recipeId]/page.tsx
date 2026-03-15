import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { CookingMode } from "@/features/cooking/cooking-mode";
import { recipesById } from "@/lib/mocks";

type CookPageProps = {
  params: Promise<{ recipeId: string }>;
};

export default async function CookPage({ params }: CookPageProps) {
  const { recipeId } = await params;
  const recipe = recipesById[recipeId];

  if (!recipe) {
    notFound();
  }

  return (
    <AppShell currentPath="/dashboard">
      <PageHeader
        eyebrow="Modo cocinar"
        title={recipe.title}
        description={recipe.description}
        action={
          <Link
            href={`/recipes/${recipe.id}`}
            className="rounded-full border border-[var(--color-border)] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]"
          >
            Receta
          </Link>
        }
      />

      <SectionCard className="mb-4">
        <div className="flex gap-3">
          <div className="flex-1 rounded-2xl bg-[rgba(255,255,255,0.06)] p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Duracion
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--color-paper)]">
              {recipe.durationMinutes} min
            </p>
          </div>
          <div className="flex-1 rounded-2xl bg-[rgba(255,255,255,0.06)] p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Raciones
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--color-paper)]">
              {recipe.baseServings} personas
            </p>
          </div>
        </div>
      </SectionCard>

      <CookingMode recipe={recipe} />
    </AppShell>
  );
}
