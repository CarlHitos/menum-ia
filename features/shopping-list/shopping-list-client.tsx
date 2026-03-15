"use client";

import { useMemo, useState } from "react";
import type { ShoppingCategory } from "@/lib/domain/types";
import { SectionCard } from "@/components/ui/section-card";

type ShoppingListClientProps = {
  categories: ShoppingCategory[];
};

export function ShoppingListClient({ categories }: ShoppingListClientProps) {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  function toggleItem(itemId: string) {
    setCheckedItems((current) =>
      current.includes(itemId)
        ? current.filter((entry) => entry !== itemId)
        : [...current, itemId],
    );
  }

  const summary = useMemo(() => {
    const totalItems = categories.reduce(
      (count, category) => count + category.items.length,
      0,
    );
    const checkedCount = checkedItems.length;
    const recipeRefs = new Set(
      categories.flatMap((category) =>
        category.items.flatMap((item) => item.sourceRecipeIds),
      ),
    );

    return {
      totalItems,
      checkedCount,
      pendingCount: totalItems - checkedCount,
      recipeRefs: recipeRefs.size,
    };
  }, [categories, checkedItems]);

  return (
    <div className="space-y-3">
      <SectionCard className="bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
          Lista semanal agregada
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-[rgba(255,255,255,0.06)] p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Items
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--color-paper)]">
              {summary.totalItems}
            </p>
          </div>
          <div className="rounded-2xl bg-[rgba(255,255,255,0.06)] p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Pendientes
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--color-paper)]">
              {summary.pendingCount}
            </p>
          </div>
          <div className="rounded-2xl bg-[rgba(255,255,255,0.06)] p-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Recetas
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--color-paper)]">
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
      </SectionCard>

      {categories.map((category) => {
        const categoryChecked = category.items.filter((item) =>
          checkedItems.includes(item.id),
        ).length;

        return (
          <SectionCard key={category.key}>
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-paper)]">
                  {category.label}
                </h2>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  {categoryChecked}/{category.items.length} marcados
                </p>
              </div>
              <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {category.items.length} items
              </span>
            </div>

            <div className="space-y-2">
              {category.items.map((item) => {
                const isChecked = checkedItems.includes(item.id);

                return (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[rgba(255,255,255,0.06)] px-3 py-3"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleItem(item.id)}
                      className="mt-1 h-4 w-4 accent-[var(--color-accent)]"
                    />
                    <span className="flex-1">
                      <span
                        className={`block text-sm font-medium ${
                          isChecked
                            ? "text-[var(--color-muted)] line-through"
                            : "text-[var(--color-paper)]"
                        }`}
                      >
                        {item.name}
                      </span>
                      <span className="mt-1 block text-xs text-[var(--color-muted)]">
                        {item.quantity} {item.unit} · {item.sourceRecipeIds.length} recetas
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}
