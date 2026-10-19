"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { ShoppingListClient } from "@/features/shopping-list/shopping-list-client";
import { RecipeBackLink } from "@/features/recipes/recipe-back-link";
import { buildShoppingListFromPlan } from "@/lib/domain/shopping-list";
import { getPlanRangeLabel } from "@/lib/domain/weekly-plan-runtime";
import {
  buildNextShoppingListState,
  flattenShoppingItems,
  getRemovedShoppingItems,
  mergeShoppingListWithState,
} from "@/lib/domain/shopping-list-state";
import type { Recipe, ShoppingListState, WeeklyPlan } from "@/lib/domain/types";

type ShoppingListPageClientProps = {
  initialPlan: WeeklyPlan | null;
  initialShoppingState: ShoppingListState | null;
  recipes: Recipe[];
};

export function ShoppingListPageClient({
  initialPlan,
  initialShoppingState,
  recipes,
}: ShoppingListPageClientProps) {
  const plan = initialPlan;
  const shoppingList = useMemo(
    () => (plan ? buildShoppingListFromPlan(plan, recipes) : null),
    [plan, recipes],
  );
  const [shoppingState, setShoppingState] = useState<ShoppingListState>(() => {
    if (!plan || !shoppingList) {
      return {
        planId: "no-plan",
        items: [],
        updatedAt: new Date().toISOString(),
      };
    }

    return buildNextShoppingListState(initialShoppingState, shoppingList);
  });
  const merged = useMemo(
    () =>
      shoppingList
        ? mergeShoppingListWithState(shoppingList, shoppingState)
        : { categories: [], removedItemKeys: [] },
    [shoppingList, shoppingState],
  );
  const removedItems = useMemo(
    () =>
      shoppingList
        ? getRemovedShoppingItems(
            shoppingState,
            flattenShoppingItems(shoppingList.categories),
          )
        : [],
    [shoppingList, shoppingState],
  );
  const hasChangesAfterConfirmation =
    plan?.status === "draft" && Boolean(plan.confirmedAt);
  const summary = useMemo(() => {
    const totalItems = merged.categories.reduce(
      (count, category) => count + category.items.length,
      0,
    );
    const checkedCount = merged.categories.reduce(
      (count, category) =>
        count + category.items.filter((item) => item.checked).length,
      0,
    );
    const recipeRefs = new Set(
      merged.categories.flatMap((category) =>
        category.items.flatMap((item) => item.sourceRecipeIds),
      ),
    );

    return {
      totalItems,
      checkedCount,
      pendingCount: totalItems - checkedCount,
      recipeRefs: recipeRefs.size,
    };
  }, [merged.categories]);

  function toggleItem(itemId: string) {
    setShoppingState((current) => {
      const nextState = {
        ...current,
        items: current.items.map((item) =>
          item.itemKey === itemId ? { ...item, checked: !item.checked } : item,
        ),
        updatedAt: new Date().toISOString(),
      };
      void persistShoppingListState(nextState);
      return nextState;
    });
  }

  function clearMarkedItems() {
    setShoppingState((current) => {
      const nextState = {
        ...current,
        items: current.items.map((item) => ({ ...item, checked: false })),
        updatedAt: new Date().toISOString(),
      };
      void persistShoppingListState(nextState);
      return nextState;
    });
  }

  if (!plan || !shoppingList) {
    return (
      <>
        <PageHeader
          eyebrow=""
          title="Compra semanal"
          description="Primero elige cuando empieza tu planificacion para generar la compra."
        />

        <SectionCard>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
            Semana activa pendiente
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
            Todavia no hay una semana materializada para este hogar. Entra al menu y elige si quieres empezar hoy o el proximo lunes.
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-flex rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Ir al menu semanal
          </Link>
        </SectionCard>
      </>
    );
  }

  return (
    <>
      <PageHeader
        compact
        eyebrow=""
        title="Compra semanal"
        description={`${plan.status === "confirmed" ? "Semana activa" : hasChangesAfterConfirmation ? "Semana en edición · Cambios recientes" : "Semana en edición"} (${getPlanRangeLabel(plan)})`}
        action={
          <RecipeBackLink href="/dashboard" label="Editar menú" />
        }
      />

      <SectionCard className="mb-3 !p-3">
        <div className="grid grid-cols-3 divide-x divide-[var(--color-border)] text-center">
          {[
            { label: "Productos", value: summary.totalItems },
            { label: "Pendientes", value: summary.pendingCount },
            { label: "Recetas", value: summary.recipeRefs },
          ].map(({ label, value }) => (
            <div key={label} className="min-w-0 px-2">
              <p className="text-[10px] uppercase tracking-[0.08em] text-[var(--color-muted)]">
                {label}
              </p>
              <p className="mt-0.5 text-base font-semibold leading-tight text-[var(--color-paper)]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <ShoppingListClient
        categories={merged.categories}
        removedItems={removedItems}
        onToggleItem={toggleItem}
        onClearMarked={clearMarkedItems}
      />
    </>
  );
}

async function persistShoppingListState(state: ShoppingListState) {
  await fetch("/api/shopping-list-state", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });
}
