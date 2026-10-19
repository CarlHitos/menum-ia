import Link from "next/link";
import type { ReactNode } from "react";
import { Blender, CookingPot, GlassWater, Microwave, RectangleHorizontal, Soup, Utensils, UtensilsCrossed } from "lucide-react";
import { formatRecipeAmount } from "./ingredient-amount";
import { RecipeBackLink } from "./recipe-back-link";
import { SectionCard } from "@/components/ui/section-card";
import { scaleRecipeIngredients } from "@/lib/domain/portioning";
import { getRecipeMetadata, recipeKindLabels, recipeSeasonLabels } from "@/lib/domain/recipe-library";
import type { Recipe } from "@/lib/domain/types";

type RecipeDetailClientProps = {
  recipe: Recipe;
  requestedServings: number;
  contextQuery?: string;
};

export function RecipeDetailClient({
  recipe,
  requestedServings,
  contextQuery = "",
}: RecipeDetailClientProps) {
  const ingredients = scaleRecipeIngredients(recipe, requestedServings);
  return (
    <>
      <div className="mb-4">
        <RecipeBackLink href={contextQuery ? "/dashboard?restoreMenu=1" : "/recipes"} label={contextQuery ? "Volver al menú" : "Volver a recetas"} />
      </div>
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
        </div>

        <div className="mt-3 flex flex-wrap gap-1">
          <RecipeChip compact label={`${requestedServings} ${requestedServings === 1 ? "comensal" : "comensales"}`} />
          <RecipeChip compact label={recipeKindLabels[getRecipeMetadata(recipe).kind]} />
          <RecipeChip compact label={recipeSeasonLabels[getRecipeMetadata(recipe).season]} />
          <RecipeChip compact label={`${recipe.durationMinutes} min`} />
          <RecipeChip compact label={formatDifficulty(recipe.difficulty)} />
        </div>
      </SectionCard>

      <SectionCard className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Ingredientes para {requestedServings} {requestedServings === 1 ? "comensal" : "comensales"}
        </p>
        <div className="mt-3 grid gap-2">
          {ingredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-[rgba(255,255,255,0.06)] px-3 py-3 text-sm"
            >
              <div className="min-w-0 flex-1">
                <span className="block text-[var(--color-paper)]">
                  {ingredient.name}
                </span>
                <span className="mt-1 block text-xs text-[var(--color-muted)]">
                  {ingredient.amountType === "exact" ? "Cantidad para esta comida" : "Ajusta al cocinar"}
                </span>
              </div>
              <span className="shrink-0 text-right font-medium text-[var(--color-paper)]">
                {formatRecipeAmount(ingredient.recipeAmount, ingredient.unit, ingredient.amountType)}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Pasos a seguir
        </p>
        <div className="mt-3 space-y-2">
          {recipe.steps.map((step, index) => (
            <div
              key={step.id}
              className="rounded-2xl bg-[rgba(255,255,255,0.06)] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span
                    aria-label={`Paso ${index + 1}`}
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.04)] text-xs font-medium tabular-nums text-[#D5B582]"
                  >
                    {index + 1}
                  </span>
                  <h2 className="text-sm font-semibold text-[var(--color-paper)]">
                    {formatStepSummary(step.title)}
                  </h2>
                </div>
                {step.timerSeconds ? (
                  <span className="shrink-0 rounded-full bg-[rgba(252,163,17,0.16)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
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
              label={utensil}
              icon={getUtensilIcon(utensil)}
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
          href={`/cook/${recipe.id}${contextQuery}`}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 active:scale-[0.98]"
        >
          <span className="text-slate-950">Abrir modo cocinar</span>
        </Link>
      </SectionCard>
    </>
  );
}

function RecipeChip({
  label,
  subtle = false,
  compact = false,
  icon,
}: {
  label: string;
  subtle?: boolean;
  compact?: boolean;
  icon?: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full ${
        compact
          ? "inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium uppercase leading-4 tracking-[0.04em]"
          : "px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em]"
      } ${
        subtle
          ? "bg-[rgba(255,255,255,0.08)] text-[var(--color-muted)]"
          : compact
            ? "bg-[rgba(252,163,17,0.10)] text-[#D5B582]"
            : "bg-[rgba(252,163,17,0.16)] text-[var(--color-accent-soft)]"
      }`}
    >
      {icon}
      {label}
    </span>
  );
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

function getUtensilIcon(utensil: string) {
  const normalized = utensil.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  let Icon = Utensils;

  if (normalized.includes("batidor")) Icon = Blender;
  else if (normalized.includes("bol")) Icon = Soup;
  else if (normalized.includes("cuchillo")) Icon = UtensilsCrossed;
  else if (normalized.includes("tabla") || normalized.includes("bandeja")) Icon = RectangleHorizontal;
  else if (normalized.includes("sarten") || normalized.includes("olla") || normalized.includes("cazo") || normalized.includes("wok")) Icon = CookingPot;
  else if (normalized.includes("horno") || normalized.includes("tostador")) Icon = Microwave;
  else if (normalized.includes("tarro") || normalized.includes("vaso")) Icon = GlassWater;

  return <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#D5B582]" strokeWidth={1.5} />;
}
