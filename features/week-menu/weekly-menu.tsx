"use client";

import { readMenuDay, rememberMenuDay, subscribeMenuDay } from "@/lib/ui/menu-navigation";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { WeeklyPlanPreviewDay } from "@/lib/domain/weekly-plan-preview";
import { SectionCard } from "@/components/ui/section-card";

type WeeklyMenuProps = {
  plan: WeeklyPlanPreviewDay[];
  viewKey?: string;
  headingLabel?: string;
  rangeLabel?: string;
  onDayChange?: () => void;
  selectedSlotId?: string | null;
  onSelectSlot?: (slotId: string) => void;
  initialDayKey?: string | null;
  onOpenRecipe?: (href: string) => void;
};

// Match links and buttons despite the global form-control font reset.
const mealActionTypography = {
  fontFamily: "inherit",
  fontSize: "0.875rem",
  fontWeight: 600,
  lineHeight: "1.25rem",
};

const mealMetaChipClassName = "inline-flex h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[rgba(252,163,17,0.16)] text-[11px] font-semibold leading-none text-[var(--color-accent)]";
const mealContextChipClassName = "inline-flex h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-[#D5A45F] bg-[#343C50] text-[11px] font-light leading-none text-[#F1EDE7]";

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
  rangeLabel,
  onDayChange,
  selectedSlotId = null,
  onSelectSlot,
  initialDayKey = null,
  onOpenRecipe,
}: WeeklyMenuProps) {
  const daySelectorRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const selector = daySelectorRef.current;
    const active = selector?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]');
    if (!selector || !active) return;
    const bounds = selector.getBoundingClientRect();
    const button = active.getBoundingClientRect();
    if (button.left < bounds.left) selector.scrollLeft -= bounds.left - button.left;
    else if (button.right > bounds.right) selector.scrollLeft += button.right - bounds.right;
  }, [selectedDay?.dayKey]);

  if (!selectedDay) {
    return null;
  }

  return (
    <div className="space-y-2">
      <SectionCard>
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
              {headingLabel}
            </p>
            {rangeLabel ? (
              <p className="-mr-1.5 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#D5A45F] bg-[#343C50] px-2.5 py-1.5 text-[11px] font-light leading-none text-[#F1EDE7]">
                <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#D5A45F]" strokeWidth={1.5} />
                <span>{rangeLabel.replace(" - ", " · ")}</span>
              </p>
            ) : null}
          </div>
          <h2 className="mt-2 text-xl font-semibold text-[var(--color-paper)]">
            {selectedDay.fullDateLabel}
          </h2>
        </div>

        <div ref={daySelectorRef} role="group" aria-label="Días del menú" className="mt-3 flex gap-1.5 overflow-x-auto overscroll-x-contain pb-1">
          {plan.map((day) => {
            const isSelected = day.dayKey === selectedDay.dayKey;
            const [dayNumber] = splitDateLabel(day.dateLabel);

            return (
              <button
                key={day.dayKey}
                type="button"
                onClick={() => {
                  setSelectedDayKey(day.dayKey);
                  if (viewKey) rememberMenuDay(viewKey, day.dayKey);
                  onDayChange?.();
                }}
                aria-label={day.fullDateLabel}
                aria-pressed={isSelected}
                className={`flex min-h-12 min-w-9 flex-1 items-center justify-center rounded-xl px-1 py-2 transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--color-accent)] ${
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
              className={`relative isolate rounded-2xl border px-4 py-3 transition-colors ${
                slot.status === "planned"
                  ? isSelected
                    ? "border-[rgba(252,163,17,0.55)] bg-[rgba(252,163,17,0.1)]"
                    : "border-[rgba(252,163,17,0.18)] bg-[rgba(255,255,255,0.06)]"
                  : "border-dashed border-[var(--color-border)] bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold leading-snug tracking-tight text-[var(--color-paper)]">
                    {slot.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      {slot.mealLabel}
                    </p>
                    {slot.servings ? (
                      <span className={`${mealMetaChipClassName} px-2`}>
                        {slot.servings} {slot.servings === 1 ? "comensal" : "comensales"}
                      </span>
                    ) : null}
                    {slot.minutes ? (
                      <span className={`${mealContextChipClassName} -mr-1.5 ml-auto gap-1.5 px-2`}>
                        <Clock aria-hidden="true" className="h-3 w-3 shrink-0 text-[#D5A45F]" strokeWidth={1.5} />
                        <span>{slot.minutes} min</span>
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {slot.status === "planned" && slot.recipeId ? (
                    <Link
                      style={mealActionTypography}
                      aria-label={`Ver receta: ${slot.title}`}
                      href={slot.recipeHref ?? `/recipes/${slot.recipeId}`}
                      onClick={onOpenRecipe ? (event) => {
                        event.preventDefault();
                        onOpenRecipe(slot.recipeHref ?? `/recipes/${slot.recipeId}`);
                      } : undefined}
                      className="group/recipe inline-flex min-h-11 flex-1 cursor-pointer items-center justify-start gap-2 py-2 text-[#F1EDE7] after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--color-accent)]"
                    >
                      <span className="text-[#F1EDE7] transition-colors group-hover/recipe:text-[var(--color-accent-soft)]">Ver receta</span>
                      <ArrowRight aria-hidden="true" className="h-4 w-4 text-[#F1EDE7] transition-transform group-hover/recipe:translate-x-0.5" strokeWidth={1.75} />
                    </Link>
                  ) : null}

                  {onSelectSlot ? (
                    <button
                      type="button"
                      aria-label={`Cambiar comida: ${slot.title}`}
                      aria-pressed={isSelected}
                      title={isSelected ? "Editando comida" : "Cambiar comida"}
                      onClick={() => onSelectSlot(slot.id)}
                      className="group/edit relative z-10 inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                    >
                      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                        isSelected
                          ? "border-[rgba(252,163,17,0.55)] bg-[rgba(252,163,17,0.08)] text-[var(--color-accent-soft)]"
                          : "border-[rgba(255,255,255,0.1)] text-[var(--color-muted)] group-hover/edit:bg-[rgba(255,255,255,0.04)] group-hover/edit:text-[var(--color-paper)]"
                      }`}>
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 3a2.83 2.83 0 0 1 4 4L7 20l-4 1 1-4Z M14 5l4 4" />
                        </svg>
                      </span>
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
