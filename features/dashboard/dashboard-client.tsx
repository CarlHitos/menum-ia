"use client";

import { SectionCard } from "@/components/ui/section-card";
import { StatPill } from "@/components/ui/stat-pill";
import { WeeklyMenu } from "@/features/week-menu/weekly-menu";
import type { OnboardingDraft } from "@/features/onboarding/types";
import type { Household } from "@/lib/domain/types";
import { loadOnboardingDraft } from "@/lib/local-storage/onboarding-storage";
import { buildDashboardContext } from "@/lib/local-storage/onboarding-mappers";
import { weeklyPlan, weeklyPlanPreview } from "@/lib/mocks";

type DashboardClientProps = {
  household: Household;
};

export function DashboardClient({ household }: DashboardClientProps) {
  const storedDraft: OnboardingDraft | null = loadOnboardingDraft();

  const context = buildDashboardContext(storedDraft, household);

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatPill label="Hogar" value={context.householdName} />
        <StatPill label="Batch" value={weeklyPlan.batchBlocks[0]?.label ?? "Activo"} />
      </div>

      <SectionCard className="mb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Esta semana
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--color-paper)]">
              {context.contextualTitle}
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {context.contextualDescription}
            </p>
          </div>
          <div className="rounded-2xl bg-[rgba(135,214,141,0.14)] px-3 py-2 text-sm font-semibold text-[var(--color-success)]">
            {weeklyPlan.leftoverFlows.length} flujos de sobras
          </div>
        </div>
      </SectionCard>

      <SectionCard className="mb-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Contexto del hogar
        </p>
        <div className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
          <p>Miembros: {context.memberSummary}</p>
          <p>{context.goalSummary}</p>
          <p>Tiempo de cocina: {context.cookingLoadLabel}</p>
          <p>Supermercado habitual: {context.preferredStore}</p>
          <p>Planificacion: {context.repeatLabel}</p>
        </div>
      </SectionCard>

      <WeeklyMenu plan={weeklyPlanPreview} />
    </>
  );
}
