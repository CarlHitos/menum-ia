"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { filterRecipes, getRecipeMetadata, recipeKindLabels, recipeSeasonLabels } from "@/lib/domain/recipe-library";
import type { MealType, Recipe, RecipeKind, RecipeSeason } from "@/lib/domain/types";

type Props = { recipes: Recipe[]; mealType?: MealType; selectedId?: string; onSelect?: (recipe: Recipe) => void };
export function RecipeBrowser({ recipes, mealType, selectedId, onSelect }: Props) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<RecipeKind | "">("");
  const [season, setSeason] = useState<RecipeSeason | "">("");
  const [maxMinutes, setMaxMinutes] = useState(0);
  const [limit, setLimit] = useState(20);
  const visible = useMemo(() => filterRecipes(recipes, { query, kind, season, maxMinutes, mealType }), [recipes, query, kind, season, maxMinutes, mealType]);
  const kinds = Object.keys(recipeKindLabels).filter((value) => recipes.some((recipe) => getRecipeMetadata(recipe).kind === value && (!mealType || getRecipeMetadata(recipe).mealTypes.includes(mealType)))) as RecipeKind[];
  const inputClass = "min-h-11 w-full min-w-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-sm text-[var(--color-paper)]";
  return <div className="mt-4 space-y-3">
    <label className="block text-sm" htmlFor={`${id}-search`}>Buscar por receta o ingrediente</label>
    <input id={`${id}-search`} type="search" placeholder="Por ejemplo: pollo, lentejas, aguacate…" value={query} onChange={(event) => { setQuery(event.target.value); setLimit(20); }} className={inputClass} />
    <div className="grid grid-cols-2 gap-3">
      <label className="text-xs text-[var(--color-muted)]">Tipo<select className={`${inputClass} mt-1`} value={kind} onChange={(event) => { setKind(event.target.value as RecipeKind | ""); setLimit(20); }}><option value="">Todos los tipos</option>{kinds.map((value) => <option key={value} value={value}>{recipeKindLabels[value]}</option>)}</select></label>
      <label className="text-xs text-[var(--color-muted)]">Temporada<select className={`${inputClass} mt-1`} value={season} onChange={(event) => { setSeason(event.target.value as RecipeSeason | ""); setLimit(20); }}><option value="">Todas</option>{Object.entries(recipeSeasonLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="col-span-2 text-xs text-[var(--color-muted)]">Tiempo de preparación<select className={`${inputClass} mt-1`} value={maxMinutes} onChange={(event) => { setMaxMinutes(Number(event.target.value)); setLimit(20); }}><option value={0}>Cualquier duración</option><option value={15}>Hasta 15 minutos</option><option value={30}>Hasta 30 minutos</option><option value={45}>Hasta 45 minutos</option></select></label>
    </div>
    <p role="status" className="text-sm text-[var(--color-muted)]">{visible.length} {visible.length === 1 ? "receta" : "recetas"}{season && season !== "all_year" ? " · Incluye recetas de todo el año" : ""}</p>
    {visible.length === 0 ? <p className="py-4 text-sm">No hay recetas con estos filtros. Prueba otro ingrediente o amplía la búsqueda.</p> : null}
    <div className="grid gap-3">{visible.slice(0, limit).map((recipe) => {
      const metadata = getRecipeMetadata(recipe);
      const active = recipe.id === selectedId;
      const contents = <><p className="font-semibold">{recipe.title}</p><p className="mt-2 text-xs text-[var(--color-muted)]">{recipeKindLabels[metadata.kind]} · {recipe.durationMinutes} min · {recipeSeasonLabels[metadata.season]}</p>{onSelect ? <p className="mt-3 text-sm text-[var(--color-accent-soft)]">{active ? "Receta actual" : "Usar en esta comida"}</p> : null}</>;
      const className = `block rounded-2xl border p-4 text-left ${active ? "border-[var(--color-accent)] bg-[rgba(252,163,17,0.12)]" : "border-[var(--color-border)] bg-[rgba(255,255,255,0.05)]"}`;
      return onSelect ? <button key={recipe.id} type="button" className={className} disabled={active} onClick={() => onSelect(recipe)}>{contents}</button> : <Link key={recipe.id} href={`/recipes/${recipe.id}`} className={className}>{contents}</Link>;
    })}</div>
    {visible.length > limit ? <button type="button" onClick={() => setLimit(limit + 20)} className="min-h-11 w-full rounded-full border border-[var(--color-border)] text-sm">Ver más recetas</button> : null}
  </div>;
}
