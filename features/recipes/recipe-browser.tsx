"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { filterRecipes, getRecipeMetadata, recipeKindLabels, recipeSeasonLabels } from "@/lib/domain/recipe-library";
import type { MealType, Recipe, RecipeKind, RecipeSeason } from "@/lib/domain/types";

type Props = {
  recipes: Recipe[];
  mealType?: MealType;
  selectedId?: string;
  onSelect?: (recipe: Recipe) => void;
  layout?: "page" | "sheet";
  leadingControls?: ReactNode;
};

export function RecipeBrowser({ recipes, mealType, selectedId, onSelect, layout = "page", leadingControls }: Props) {
  const id = useId();
  const sheet = layout === "sheet";
  const resultsRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<RecipeKind | "">("");
  const [season, setSeason] = useState<RecipeSeason | "">("");
  const [difficulty, setDifficulty] = useState<Recipe["difficulty"] | "">("");
  const [maxMinutes, setMaxMinutes] = useState(0);
  const [limit, setLimit] = useState(20);
  const visible = useMemo(() => filterRecipes(recipes, { query, kind, season, difficulty, maxMinutes, mealType }), [recipes, query, kind, season, difficulty, maxMinutes, mealType]);
  const kinds = Object.keys(recipeKindLabels).filter((value) => recipes.some((recipe) => getRecipeMetadata(recipe).kind === value && (!mealType || getRecipeMetadata(recipe).mealTypes.includes(mealType)))) as RecipeKind[];
  const inputClass = "min-h-11 w-full min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-ink)] px-3 text-sm text-[var(--color-paper)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]";

  function resetResults() {
    setLimit(20);
    if (resultsRef.current) resultsRef.current.scrollTop = 0;
  }

  const activeFilters = Number(Boolean(kind)) + Number(Boolean(maxMinutes)) + Number(Boolean(difficulty)) + Number(Boolean(season));
  const filters = (
    <div className={`grid gap-2 ${sheet ? "grid-cols-3" : "grid-cols-2"}`}>
      <label className="min-w-0 text-xs text-[var(--color-muted)]">Tipo<select className={`${inputClass} mt-1`} value={kind} onChange={(event) => { setKind(event.target.value as RecipeKind | ""); resetResults(); }}><option value="">Todos</option>{kinds.map((value) => <option key={value} value={value}>{recipeKindLabels[value]}</option>)}</select></label>
      {!sheet ? <label className="text-xs text-[var(--color-muted)]">Temporada<select className={`${inputClass} mt-1`} value={season} onChange={(event) => { setSeason(event.target.value as RecipeSeason | ""); resetResults(); }}><option value="">Todas</option>{Object.entries(recipeSeasonLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label> : null}
      <label className="min-w-0 text-xs text-[var(--color-muted)]">Tiempo<select className={`${inputClass} mt-1`} value={maxMinutes} onChange={(event) => { setMaxMinutes(Number(event.target.value)); resetResults(); }}><option value={0}>Cualquiera</option><option value={15}>≤ 15 min</option><option value={30}>≤ 30 min</option><option value={45}>≤ 45 min</option></select></label>
      <label className="min-w-0 text-xs text-[var(--color-muted)]">Dificultad<select className={`${inputClass} mt-1`} value={difficulty} onChange={(event) => { setDifficulty(event.target.value as Recipe["difficulty"] | ""); resetResults(); }}><option value="">Todas</option><option value="easy">Fácil</option><option value="medium">Media</option></select></label>
    </div>
  );
  const resultCount = `${visible.length} ${visible.length === 1 ? "receta" : "recetas"}${season && season !== "all_year" ? " · Incluye recetas de todo el año" : ""}`;

  return (
    <div className={sheet ? "flex min-h-0 flex-1 flex-col" : "mt-4 space-y-3"}>
      <div className={sheet ? "shrink-0 space-y-2 border-b border-[var(--color-border)] px-4 pb-2" : "space-y-2 rounded-2xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.05)] px-4 pt-3 pb-2"}>
        {leadingControls}
        <div>
          <label className="sr-only" htmlFor={`${id}-search`}>Buscar por receta o ingrediente</label>
          <input id={`${id}-search`} type="search" placeholder="Buscar receta o ingrediente…" value={query} onChange={(event) => { setQuery(event.target.value); resetResults(); }} className={inputClass} />
        </div>
        <details className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg text-sm text-[var(--color-paper)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              Filtros{activeFilters ? <span className="rounded-full bg-[rgba(252,163,17,0.16)] px-2 text-xs text-[var(--color-accent)]">{activeFilters} {activeFilters === 1 ? "activo" : "activos"}</span> : null}
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 transition-transform group-open:rotate-180"><path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" /></svg>
            </span>
            <span role="status" className="min-w-0 text-right text-xs text-[var(--color-muted)]">{resultCount}</span>
          </summary>
          <div className={sheet ? "max-h-[20dvh] overflow-y-auto overscroll-contain pb-2" : "pb-2"}>
            {filters}
            {activeFilters ? <button type="button" onClick={() => { setKind(""); setSeason(""); setMaxMinutes(0); setDifficulty(""); resetResults(); }} className="mt-1 min-h-9 text-xs text-[var(--color-muted)] underline">Limpiar filtros</button> : null}
          </div>
        </details>
      </div>
      <div ref={resultsRef} role={sheet ? "region" : undefined} aria-label={sheet ? "Recetas alternativas" : undefined} tabIndex={sheet ? 0 : undefined} className={sheet ? "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]" : "space-y-3"}>
        {visible.length === 0 ? <p className="py-4 text-sm">No hay recetas con estos filtros. Prueba otro ingrediente o amplía la búsqueda.</p> : null}
        <div className="grid gap-3">{visible.slice(0, limit).map((recipe) => {
          const metadata = getRecipeMetadata(recipe);
          const active = recipe.id === selectedId;
          const contents = <><p className="font-semibold">{recipe.title}</p><p className="mt-2 text-xs text-[var(--color-muted)]">{recipeKindLabels[metadata.kind]} · {recipe.durationMinutes} min · {recipeSeasonLabels[metadata.season]}</p>{onSelect && !sheet ? <p className="mt-3 text-sm text-[var(--color-accent-soft)]">{active ? "Receta actual" : "Usar en esta comida"}</p> : null}{!onSelect ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--color-muted)]">{recipe.difficulty === "easy" ? "Fácil" : "Media"}</span>
              <span className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-accent)] px-4 text-sm font-semibold text-slate-950">Ver receta</span>
            </div>
          ) : null}</>;
          const className = `block rounded-2xl border p-4 text-left ${active ? "border-[var(--color-accent)] bg-[rgba(252,163,17,0.12)]" : "border-[var(--color-border)] bg-[rgba(255,255,255,0.05)]"}`;
          if (sheet && onSelect) return (
            <div key={recipe.id} className={className}>
              {contents}
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-[var(--color-muted)]">{recipe.difficulty === "easy" ? "Fácil" : "Media"}</span>
                <button type="button" disabled={active} aria-label={active ? `Receta actual: ${recipe.title}` : `Reemplazar por ${recipe.title}`} onClick={() => onSelect(recipe)} className="min-h-11 rounded-full bg-[var(--color-accent)] px-4 text-sm font-semibold text-slate-950 disabled:bg-[rgba(255,255,255,0.08)] disabled:text-[var(--color-muted)]">
                  {active ? "Receta actual" : "Reemplazar"}
                </button>
              </div>
            </div>
          );
          return onSelect ? <button key={recipe.id} type="button" className={className} disabled={active} onClick={() => onSelect(recipe)}>{contents}</button> : <Link key={recipe.id} href={`/recipes/${recipe.id}`} className={className}>{contents}</Link>;
        })}</div>
        {visible.length > limit ? <button type="button" onClick={() => setLimit(limit + 20)} className="mt-3 min-h-11 w-full rounded-full border border-[var(--color-border)] text-sm">Ver más recetas</button> : null}
      </div>
    </div>
  );
}
