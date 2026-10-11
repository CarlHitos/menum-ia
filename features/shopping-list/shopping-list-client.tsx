"use client";

import { useMemo, useState } from "react";
import { formatShoppingAmount } from "@/features/shopping-list/shopping-quantity";
import type { ShoppingCategory, ShoppingItem } from "@/lib/domain/types";
import { SectionCard } from "@/components/ui/section-card";

type ShoppingListClientProps = {
  categories: ShoppingCategory[];
  removedItems?: ShoppingItem[];
  onToggleItem: (itemId: string) => void;
  onClearMarked: () => void;
};

export function ShoppingListClient({
  categories,
  removedItems = [],
  onToggleItem,
  onClearMarked,
}: ShoppingListClientProps) {
  const categoriesWithProgress = useMemo(
    () =>
      categories.map((category) => {
        const checkedCount = category.items.filter((item) => item.checked).length;
        const orderedItems = [
          ...category.items.filter((item) => !item.checked),
          ...category.items.filter((item) => item.checked),
        ];
        const isComplete =
          category.items.length > 0 && checkedCount === category.items.length;

        return {
          ...category,
          checkedCount,
          orderedItems,
          isComplete,
        };
      }),
    [categories],
  );
  const [openCategoryKeys, setOpenCategoryKeys] = useState<string[]>(
    categories[0] ? [categories[0].key] : [],
  );

  function toggleCategory(categoryKey: string) {
    setOpenCategoryKeys((current) =>
      current.includes(categoryKey)
        ? current.filter((key) => key !== categoryKey)
        : [...current, categoryKey],
    );
  }

  return (
    <div className="space-y-3">
      {categoriesWithProgress.map((category) => {
        const isOpen = openCategoryKeys.includes(category.key);

        return (
          <SectionCard
            key={category.key}
            className={
              category.isComplete
                ? "border-[rgba(135,214,141,0.22)] bg-[rgba(255,255,255,0.04)]"
                : undefined
            }
          >
            <button
              type="button"
              onClick={() => toggleCategory(category.key)}
              aria-expanded={isOpen}
              aria-controls={`shopping-category-${category.key}`}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex min-w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent-soft)]">
                  {isOpen ? "Ocultar" : "Ver"}
                </span>
                <div>
                  <h2 className="text-base font-semibold text-[var(--color-paper)]">
                    {category.label}
                  </h2>
                  <p
                    className={`mt-1 text-xs uppercase tracking-[0.18em] ${
                      category.isComplete
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-muted)]"
                    }`}
                  >
                    {category.checkedCount}/{category.items.length} marcados
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {category.items.length} productos
              </span>
            </button>

            {isOpen ? (
              <div id={`shopping-category-${category.key}`} className="mt-4 space-y-2">
                {category.orderedItems.map((item) => {
                  const isChecked = item.checked;

                  return (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-start gap-3 rounded-2xl bg-[rgba(255,255,255,0.06)] px-3 py-3"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleItem(item.id)}
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
                          {formatShoppingAmount(item)} · {item.sourceRecipeIds.length} {item.sourceRecipeIds.length === 1 ? "receta" : "recetas"}
                          {item.hasUnquantifiedAmount && item.amountType === "exact" ? " + según necesidad" : ""}
                        </span>
                      </span>
                    </label>
                  );
                })}
                {category.isComplete ? (
                  <p className="rounded-2xl bg-[rgba(255,255,255,0.06)] px-3 py-3 text-sm text-[var(--color-success)]">
                    Categoria completada. Todo este grupo ya esta marcado.
                  </p>
                ) : null}
              </div>
            ) : null}
          </SectionCard>
        );
      })}

      {removedItems.length ? (
        <SectionCard>
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-paper)]">
                Ya no necesario
              </h2>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                Ingredientes que han dejado de hacer falta tras editar la semana
              </p>
            </div>
            <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {removedItems.length} items
            </span>
          </div>

          <div className="space-y-2">
            {removedItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-dashed border-[var(--color-border)] bg-[rgba(255,255,255,0.04)] px-3 py-3"
              >
                <span className="block text-sm font-medium text-[var(--color-muted)] line-through">
                  {item.name}
                </span>
                <span className="mt-1 block text-xs text-[var(--color-muted)]">
                  {formatShoppingAmount(item)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onClearMarked}
          className="rounded-full border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-paper)] transition hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
        >
          Desmarcar todo
        </button>
      </div>
    </div>
  );
}
