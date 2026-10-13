"use client";

import { readMenuDay, rememberMenuDay, subscribeMenuDay } from "@/lib/ui/menu-navigation";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import type { WeeklyPlanPreviewDay } from "@/lib/domain/weekly-plan-preview";
import { SectionCard } from "@/components/ui/section-card";

type WeeklyMenuProps = {
  plan: WeeklyPlanPreviewDay[];
  viewKey?: string;
  headingLabel?: string;
  onDayChange?: () => void;
  selectedSlotId?: string | null;
  onSelectSlot?: (slotId: string) => void;
  initialDayKey?: string | null;
  onOpenRecipe?: (href: string) => void;
};

const weekdayOrder = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export function WeeklyMenu({
  plan,
  viewKey,
  headingLabel = "Comidas del día",
  onDayChange,
  selectedSlotId = null,
  onSelectSlot,
  initialDayKey = null,
  onOpenRecipe,
}: WeeklyMenuProps) {
  const defaultDayKey = useMemo(() => {
    if (initialDayKey && plan.some((day) => day.dayKey === initialDayKey)) {
      return initialDayKey;
    }

    const todayKey = weekdayOrder[new Date().getDay()];
    return plan.some((day) => day.dayKey === todayKey) ? todayKey : plan[0]?.dayKey ?? "";
  }, [initialDayKey, plan]);

  const restoredDayKey = useSyncExternalStore(
    subscribeMenuDay,
    () => viewKey ? readMenuDay(viewKey, plan.map((day) => day.dayKey), defaultDayKey) : defaultDayKey,
    () => defaultDayKey,
  );
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const selectedDay =
    plan.find((day) => day.dayKey === (selectedDayKey ?? restoredDayKey)) ?? plan[0] ?? null;

  if (!selectedDay) {
    return null;
  }

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
              {headingLabel}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--color-paper)]">
              {selectedDay.fullDateLabel}
            </h2>
          </div>
          <span className="inline-flex min-w-20 items-center justify-center rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-2 text-center text-[11px] font-semibold text-[var(--color-muted)]">
            {selectedDay.shortLabel} · {selectedDay.dateLabel}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {plan.map((day) => {
            const isSelected = day.dayKey === selectedDay.dayKey;
            const [dayNumber, dayMonth] = splitDateLabel(day.dateLabel);

            return (
              <button
                key={day.dayKey}
                type="button"
                onClick={() => {
                  setSelectedDayKey(day.dayKey);
                  if (viewKey) rememberMenuDay(viewKey, day.dayKey);
                  onDayChange?.();
                }}
                aria-pressed={isSelected}
                className={`flex min-h-12 items-center justify-center rounded-2xl px-2 py-3 transition ${
                  isSelected
                    ? "bg-[var(--color-accent)] text-slate-950"
                    : "border border-[var(--color-border)] bg-[rgba(255,255,255,0.05)] text-[var(--color-paper)] hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
                }`}
              >
                <span className="block text-center">
                  <span className="block text-xs font-semibold leading-none sm:text-sm">
                    {day.shortLabel}
                  </span>
                  <span className="mt-1 block text-[10px] leading-none opacity-80">
                    {dayNumber}
                  </span>
                  <span className="mt-1 block text-[10px] leading-none opacity-80">
                    {dayMonth}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <div className="grid gap-3">
        {selectedDay.slots.map((slot) => {
          const isSelected = selectedSlotId === slot.id;

          return (
            <div
              key={slot.id}
              id={`meal-${slot.id}`}
              tabIndex={-1}
              aria-label={`${slot.mealLabel}: ${slot.title}`}
              className={`rounded-2xl border px-4 py-4 transition ${
                slot.status === "planned"
                  ? isSelected
                    ? "border-[rgba(252,163,17,0.55)] bg-[rgba(252,163,17,0.1)]"
                    : "border-[rgba(252,163,17,0.18)] bg-[rgba(255,255,255,0.06)]"
                  : "border-dashed border-[var(--color-border)] bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        {slot.mealLabel}
                      </p>
                      {slot.servings ? (
                        <span className="whitespace-nowrap rounded-full bg-[rgba(255,255,255,0.05)] px-2 py-1 text-[10px] text-[var(--color-paper)]/85">
                          {slot.servings} {slot.servings === 1 ? "comensal" : "comensales"}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold leading-tight text-[var(--color-paper)]">
                      {slot.title}
                    </h3>
                  </div>

                  {slot.minutes ? (
                    <div className="flex min-w-16 flex-col items-center justify-center rounded-2xl bg-[rgba(252,163,17,0.16)] px-3 py-2 text-center">
                      <p className="text-lg font-semibold text-[var(--color-accent)]">
                        {slot.minutes}
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        min
                      </p>
                    </div>
                  ) : null}
                </div>

                {slot.description ? (
                  <p className="text-sm leading-6 text-[var(--color-muted)]">
                    {slot.description}
                  </p>
                ) : null}

                <div className="flex items-center gap-3">
                  {slot.status === "planned" && slot.recipeId ? (
                    <Link
                      href={slot.recipeHref ?? `/recipes/${slot.recipeId}`}
                      onClick={onOpenRecipe ? (event) => {
                        event.preventDefault();
                        onOpenRecipe(slot.recipeHref ?? `/recipes/${slot.recipeId}`);
                      } : undefined}
                      className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.06)] px-4 py-2.5 text-sm font-semibold text-[var(--color-paper)] transition-all duration-150 ease-in-out hover:border-[var(--color-accent)] hover:bg-[rgba(252,163,17,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] active:scale-95 active:bg-[var(--color-accent)] active:text-slate-950"
                    >
                      Ver receta
                    </Link>
                  ) : null}

                  {onSelectSlot ? (
                    <button
                      type="button"
                      onClick={() => onSelectSlot(slot.id)}
                      className={`inline-flex min-h-11 min-w-20 items-center justify-center rounded-full border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
                        isSelected
                          ? "border-[rgba(252,163,17,0.55)] bg-[rgba(252,163,17,0.08)] text-[var(--color-accent-soft)]"
                          : "border-[var(--color-border)] text-[var(--color-paper)] hover:bg-[rgba(255,255,255,0.06)] active:bg-[rgba(255,255,255,0.1)]"
                      }`}
                    >
                      {isSelected ? "Editando" : "Editar"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function splitDateLabel(dateLabel: string) {
  const [dayNumber = dateLabel, dayMonth = ""] = dateLabel.split(/\s+/, 2);
  return [dayNumber, dayMonth];
}
