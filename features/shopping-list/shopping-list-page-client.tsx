"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { ShoppingListClient } from "@/features/shopping-list/shopping-list-client";
import { buildShoppingListFromPlan } from "@/lib/domain/shopping-list";
import {
  buildNextShoppingListState,
  flattenShoppingItems,
  getRemovedShoppingItems,
  mergeShoppingListWithState,
} from "@/lib/domain/shopping-list-state";
import type { ShoppingListState } from "@/lib/domain/types";
import {
  loadShoppingListState,
  saveShoppingListState,
} from "@/lib/local-storage/shopping-list-state-storage";
import { loadActiveWeeklyPlan } from "@/lib/local-storage/weekly-plan-storage";
import { recipes } from "@/lib/mocks";

export function ShoppingListPageClient() {
  const plan = useMemo(() => loadActiveWeeklyPlan(), []);
  const shoppingList = useMemo(
    () => (plan ? buildShoppingListFromPlan(plan, recipes) : null),
    [plan],
  );
  const [shoppingState, setShoppingState] = useState<ShoppingListState>(() => {
    if (!plan || !shoppingList) {
      return {
        planId: "no-plan",
        items: [],
        updatedAt: new Date().toISOString(),
      };
    }

    const stored = loadShoppingListState(plan.id);
    const nextState = buildNextShoppingListState(stored, shoppingList);
    saveShoppingListState(nextState);
    return nextState;
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
  const recipeCount = useMemo(() => {
    if (!plan) {
      return 0;
    }

    return new Set(
      plan.days.flatMap((day) => day.slots.map((slot) => slot.recipeId)),
    ).size;
  }, [plan]);
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
      saveShoppingListState(nextState);
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
      saveShoppingListState(nextState);
      return nextState;
    });
  }

  if (!plan || !shoppingList) {
    return (
      <>
        <PageHeader
          eyebrow=""
          title="Lista inteligente"
          description="Primero elige cuando empieza vuestra planificacion para generar la compra."
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
        eyebrow=""
        title="Lista inteligente"
        description={`${recipeCount} recetas optimizadas para vuestro presupuesto.`}
      />

      <SectionCard className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
          {plan.status === "confirmed"
            ? "Compra vinculada a la semana activa"
            : hasChangesAfterConfirmation
              ? "Compra actualizada con cambios recientes"
              : "Compra vinculada a la semana en edicion"}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          {plan.status === "confirmed"
            ? "Esta lista refleja la semana que habeis dejado lista para comprar y cocinar."
            : hasChangesAfterConfirmation
              ? "Has cambiado una semana que ya estaba cerrada. Esta compra ya usa la version actual del menu."
              : "Esta lista se ira ajustando mientras cambies recetas antes de cerrar la semana."}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
              plan.status === "confirmed"
                ? "bg-[rgba(135,214,141,0.18)] text-[var(--color-success)]"
                : "bg-[rgba(252,163,17,0.16)] text-[var(--color-accent-soft)]"
            }`}
          >
            {plan.status === "confirmed" ? "Semana confirmada" : "Semana en edicion"}
          </span>
          {plan.status === "draft" ? (
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-[var(--color-muted)] transition hover:text-[var(--color-paper)]"
            >
              Confirmar semana desde el menu
            </Link>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard className="mb-4 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-3 text-center text-sm font-semibold text-slate-950"
            >
              Editar menu
            </Link>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Cobertura semanal
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--color-paper)]">
              Desayunos, comidas, snacks y cenas de lunes a domingo
            </h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-[rgba(255,255,255,0.06)] px-2 py-3 text-center">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  Productos
                </p>
                <p className="mt-1 text-lg font-semibold leading-none text-[var(--color-paper)]">
                  {summary.totalItems}
                </p>
              </div>
              <div className="rounded-2xl bg-[rgba(255,255,255,0.06)] px-2 py-3 text-center">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  Pendientes
                </p>
                <p className="mt-1 text-lg font-semibold leading-none text-[var(--color-paper)]">
                  {summary.pendingCount}
                </p>
              </div>
              <div className="rounded-2xl bg-[rgba(255,255,255,0.06)] px-2 py-3 text-center">
                <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">
                  Recetas
                </p>
                <p className="mt-1 text-lg font-semibold leading-none text-[var(--color-paper)]">
                  {summary.recipeRefs}
                </p>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-[rgba(255,255,255,0.08)]">
              <div
                className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                style={{
                  width:
                    summary.totalItems === 0
                      ? "0%"
                      : `${(summary.checkedCount / summary.totalItems) * 100}%`,
                }}
              />
            </div>
          </div>
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
