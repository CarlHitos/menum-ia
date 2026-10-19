"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { useSyncExternalStore } from "react";
import { SectionCard } from "@/components/ui/section-card";
import { rememberMenuDay, takeMenuPosition } from "@/lib/ui/menu-navigation";
import { findHomeDay, type HomeSummaryData } from "./home-summary-data";

function getLocalDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function subscribeDate(onChange: () => void) {
  const interval = window.setInterval(onChange, 60_000);
  window.addEventListener("focus", onChange);
  document.addEventListener("visibilitychange", onChange);
  return () => {
    window.clearInterval(interval);
    window.removeEventListener("focus", onChange);
    document.removeEventListener("visibilitychange", onChange);
  };
}

export function TodayMenu({ days, status, rangeLabel, viewKey }: Pick<HomeSummaryData, "days" | "status" | "rangeLabel"> & { viewKey?: string }) {
  const localDate = useSyncExternalStore(subscribeDate, getLocalDate, () => "");
  const today = findHomeDay(days, localDate);
  const meals = today?.slots.filter((slot) => slot.status === "planned") ?? [];

  return (
    <SectionCard className="border-[rgba(252,163,17,0.22)]">
      <h2 className="text-xs uppercase tracking-[0.16em] text-[var(--color-accent-soft)]">Menú de hoy</h2>
      {status && !localDate ? (
        <p role="status" className="mt-3 text-sm text-[var(--color-muted)]">Cargando las comidas de hoy…</p>
      ) : meals.length ? (
        <ul className="mt-2 divide-y divide-[var(--color-border)]">
          {meals.map((meal) => (
            <li key={meal.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 py-3 last:pb-0">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-muted)]">{meal.mealLabel}</p>
                  {meal.minutes ? <span className="inline-flex items-center gap-1 text-[11px] text-[#D5B582]"><Clock aria-hidden="true" className="h-3 w-3" strokeWidth={1.5} />{meal.minutes} min</span> : null}
                </div>
                <h3 className="mt-1 text-sm font-semibold leading-snug text-[var(--color-paper)]">{meal.title}</h3>
              </div>
              <Link href={meal.recipeHref!} onClick={() => {
                if (viewKey && today) {
                  rememberMenuDay(viewKey, today.dayKey);
                  takeMenuPosition(viewKey);
                }
              }} aria-label={`Ver receta: ${meal.title}`} className="group inline-flex min-h-11 items-center gap-1.5 rounded-lg text-xs font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
                <span className="text-[var(--color-paper)] transition-colors group-hover:text-[var(--color-accent-soft)]">Ver receta</span>
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 text-[#D5B582] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3">
          <p className="text-sm text-[var(--color-paper)]">
            {!status ? "Aún no tienes un menú semanal." : !today ? "Hoy no está incluido en tu plan." : "No hay comidas planificadas para hoy."}
          </p>
          {status && !today ? <p className="mt-1 text-xs text-[var(--color-muted)]">Tu plan: {rangeLabel}.</p> : null}
          <Link href="/dashboard" className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]">
            <span className="text-[var(--color-accent-soft)]">{status ? "Ver menú semanal" : "Generar menú"}</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 text-[var(--color-accent-soft)]" />
          </Link>
        </div>
      )}
    </SectionCard>
  );
}
