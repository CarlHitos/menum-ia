"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { WeeklyPlanPreviewDay } from "@/lib/domain/weekly-plan-preview";
import { SectionCard } from "@/components/ui/section-card";

type WeeklyMenuProps = {
  plan: WeeklyPlanPreviewDay[];
  selectedSlotId?: string | null;
  onSelectSlot?: (slotId: string) => void;
  initialDayKey?: string | null;
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
  selectedSlotId = null,
  onSelectSlot,
  initialDayKey = null,
}: WeeklyMenuProps) {
  const defaultDayKey = useMemo(() => {
    if (initialDayKey && plan.some((day) => day.dayKey === initialDayKey)) {
      return initialDayKey;
    }

    const todayKey = weekdayOrder[new Date().getDay()];
    return plan.some((day) => day.dayKey === todayKey) ? todayKey : plan[0]?.dayKey ?? "";
  }, [initialDayKey, plan]);

  const [selectedDayKey, setSelectedDayKey] = useState(defaultDayKey);
  const [openInfoSlotId, setOpenInfoSlotId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedDayKey(defaultDayKey);
  }, [defaultDayKey]);

  const selectedDay =
    plan.find((day) => day.dayKey === selectedDayKey) ?? plan[0] ?? null;

  if (!selectedDay) {
    return null;
  }

  return (
    <div className="space-y-4">
      <SectionCard>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
              Semana activa
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

            return (
              <button
                key={day.dayKey}
                type="button"
                onClick={() => {
                  setSelectedDayKey(day.dayKey);
                  setOpenInfoSlotId(null);
                }}
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
                    {day.dateLabel}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <div className="grid gap-3">
        {selectedDay.slots.map((slot) => {
          const infoOpen = openInfoSlotId === slot.id;
          const isSelected = selectedSlotId === slot.id;

          return (
            <div
              key={slot.id}
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
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        {slot.mealLabel}
                      </p>
                      <span className="inline-flex min-w-20 items-center justify-center rounded-full bg-[rgba(255,255,255,0.08)] px-2 py-1 text-center text-[10px] font-semibold text-[var(--color-accent-soft)]">
                        {selectedDay.shortLabel} · {selectedDay.dateLabel}
                      </span>
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

                <div className="flex flex-wrap items-center gap-2">
                  {slot.status === "planned" && slot.recipeId ? (
                    <Link
                      href={`/recipes/${slot.recipeId}`}
                      className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.08)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-paper)] transition hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
                    >
                      Ver receta
                    </Link>
                  ) : null}

                  {onSelectSlot ? (
                    <button
                      type="button"
                      onClick={() => onSelectSlot(slot.id)}
                      className={`inline-flex items-center justify-center rounded-full border px-3 py-2 font-semibold uppercase transition ${
                        isSelected
                          ? "border-[rgba(252,163,17,0.55)] bg-[var(--color-accent)] text-slate-950"
                          : "border-[var(--color-border)] bg-[rgba(255,255,255,0.08)] text-[var(--color-paper)] hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
                      }`}
                      style={{ fontSize: "11px", letterSpacing: "0.1em" }}
                    >
                      {isSelected ? "Editando" : "Editar"}
                    </button>
                  ) : null}

                  {slot.badges.length ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        setOpenInfoSlotId((current) =>
                          current === slot.id ? null : slot.id,
                        );
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-sm font-semibold text-[var(--color-paper)] transition hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
                      aria-label={`Mas informacion sobre ${slot.title}`}
                    >
                      i
                    </button>
                  ) : null}
                </div>

              {slot.badges.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {slot.badges.map((badge) => (
                    <span
                      key={badge.tag}
                      className="rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]"
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              ) : null}

              {infoOpen ? (
                <div className="mt-3 rounded-2xl bg-[rgba(255,255,255,0.05)] px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
                    Informacion del bloque
                  </p>
                  <div className="mt-2 space-y-2 text-sm leading-6 text-[var(--color-muted)]">
                    {slot.badges.map((badge) => (
                      <p key={badge.tag}>
                        <span className="font-semibold text-[var(--color-paper)]">
                          {badge.label}:
                        </span>{" "}
                        {badge.description}
                      </p>
                    ))}
                  </div>
                </div>
              ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
