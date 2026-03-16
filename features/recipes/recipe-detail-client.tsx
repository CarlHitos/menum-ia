import Link from "next/link";
import { SectionCard } from "@/components/ui/section-card";
import { formatGoalLabel } from "@/lib/domain/goal-labels";
import type { Household, Recipe } from "@/lib/domain/types";

type RecipeDetailClientProps = {
  recipe: Recipe;
  household: Household;
};

export function RecipeDetailClient({
  recipe,
  household,
}: RecipeDetailClientProps) {
  return (
    <>
      <SectionCard className="mb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
              Receta
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--color-paper)]">
              {recipe.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
              {recipe.description}
            </p>
          </div>
          <Link
            href={`/cook/${recipe.id}`}
            className="rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Cocinar
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <RecipeChip label={formatMealType(recipe.category)} />
          <RecipeChip label={`${recipe.durationMinutes} min`} />
          <RecipeChip label={formatDifficulty(recipe.difficulty)} />
        </div>
      </SectionCard>

      <SectionCard className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Ingredientes base
        </p>
        <div className="mt-3 grid gap-2">
          {recipe.ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-[rgba(255,255,255,0.06)] px-3 py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(252,163,17,0.12)] text-lg">
                  {getIngredientEmoji(ingredient.name)}
                </span>
                <div>
                  <span className="block text-[var(--color-paper)]">
                    {ingredient.name}
                  </span>
                  <span className="mt-1 block text-xs text-[var(--color-muted)]">
                    {ingredient.scalable ? "Se ajusta por racion" : "Cantidad estable"}
                  </span>
                </div>
              </div>
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
                  {formatGoalLabel(member.goal)}
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
                    <p>Misma base comun, sin cambios para esta persona.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Resumen del flujo
        </p>
        <div className="mt-3 space-y-2">
          {recipe.steps.map((step, index) => (
            <div
              key={step.id}
              className="rounded-2xl bg-[rgba(255,255,255,0.06)] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl leading-none">
                    {getStepEmoji(step.title)}
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
                      Paso {index + 1}
                    </p>
                    <h2 className="mt-1 text-sm font-semibold text-[var(--color-paper)]">
                      {formatStepSummary(step.title)}
                    </h2>
                  </div>
                </div>
                {step.timerSeconds ? (
                  <span className="rounded-full bg-[rgba(252,163,17,0.16)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                    {Math.ceil(step.timerSeconds / 60)} min
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Utensilios necesarios
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {recipe.utensils.map((utensil) => (
            <RecipeChip
              key={utensil}
              label={`${getUtensilEmoji(utensil)} ${utensil}`}
              subtle
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Sustituciones
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {recipe.substitutions.map((substitution) => (
            <RecipeChip key={substitution} label={substitution} subtle />
          ))}
        </div>
      </SectionCard>

      <SectionCard className="bg-[linear-gradient(145deg,rgba(255,255,255,0.12),rgba(252,163,17,0.14))]">
        <Link
          href={`/cook/${recipe.id}`}
          className="inline-flex rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-slate-950"
        >
          Abrir modo cocinar
        </Link>
      </SectionCard>
    </>
  );
}

function RecipeChip({
  label,
  subtle = false,
}: {
  label: string;
  subtle?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
        subtle
          ? "bg-[rgba(255,255,255,0.08)] text-[var(--color-muted)]"
          : "bg-[rgba(252,163,17,0.16)] text-[var(--color-accent-soft)]"
      }`}
    >
      {label}
    </span>
  );
}

function formatMealType(mealType: string) {
  switch (mealType) {
    case "breakfast":
      return "Desayuno";
    case "lunch":
      return "Comida";
    case "snack":
      return "Snack / merienda";
    case "dinner":
      return "Cena";
    default:
      return mealType;
  }
}

function formatDifficulty(value: string) {
  switch (value) {
    case "easy":
      return "Facil";
    case "medium":
      return "Media";
    default:
      return value;
  }
}

function formatStepSummary(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("base")) {
    return "Tostar y preparar base";
  }

  if (normalized.includes("mezcla") || normalized.includes("ajusta")) {
    return "Ajustar la mezcla";
  }

  if (normalized.includes("huevo")) {
    return "Cocinar huevos";
  }

  if (normalized.includes("servir") || normalized.includes("termina")) {
    return "Rematar y servir";
  }

  if (normalized.includes("horno")) {
    return "Hornear y controlar";
  }

  if (normalized.includes("saltea")) {
    return "Saltear ingredientes";
  }

  return title;
}

function getStepEmoji(title: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("base") || normalized.includes("tosta")) {
    return "🍞";
  }

  if (normalized.includes("mezcla") || normalized.includes("crema")) {
    return "🥣";
  }

  if (normalized.includes("huevo")) {
    return "🍳";
  }

  if (normalized.includes("horno")) {
    return "🔥";
  }

  if (normalized.includes("saltea")) {
    return "🍲";
  }

  if (normalized.includes("servir") || normalized.includes("termina")) {
    return "✨";
  }

  return "🍽️";
}

function getUtensilEmoji(utensil: string) {
  const normalized = utensil.toLowerCase();

  if (normalized.includes("tost")) {
    return "🍞";
  }

  if (normalized.includes("bol")) {
    return "🥣";
  }

  if (normalized.includes("sarten")) {
    return "🍳";
  }

  if (normalized.includes("horno")) {
    return "🔥";
  }

  if (normalized.includes("cuch")) {
    return "🥄";
  }

  if (normalized.includes("tabla")) {
    return "🔪";
  }

  return "🍽️";
}

function getIngredientEmoji(name: string) {
  const normalized = name.toLowerCase();

  if (normalized.includes("huevo")) {
    return "🥚";
  }

  if (normalized.includes("aguacate")) {
    return "🥑";
  }

  if (normalized.includes("tomate")) {
    return "🍅";
  }

  if (normalized.includes("pan") || normalized.includes("wrap")) {
    return "🍞";
  }

  if (normalized.includes("pollo") || normalized.includes("pavo")) {
    return "🍗";
  }

  if (normalized.includes("yogur") || normalized.includes("queso")) {
    return "🧀";
  }

  if (normalized.includes("arroz") || normalized.includes("avena")) {
    return "🌾";
  }

  if (normalized.includes("fruta") || normalized.includes("platano") || normalized.includes("mango")) {
    return "🍎";
  }

  if (normalized.includes("espinaca") || normalized.includes("verdura") || normalized.includes("brocoli")) {
    return "🥬";
  }

  return "•";
}
