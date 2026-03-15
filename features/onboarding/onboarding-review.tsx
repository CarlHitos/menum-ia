import Link from "next/link";
import { SectionCard } from "@/components/ui/section-card";
import type { OnboardingDraft } from "@/features/onboarding/types";

type OnboardingReviewProps = {
  draft: OnboardingDraft;
};

export function OnboardingReview({ draft }: OnboardingReviewProps) {
  return (
    <div className="space-y-4">
      <SectionCard className="bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
          Resumen final
        </p>
        <h2 className="mt-2 text-xl font-semibold text-[var(--color-paper)]">
          {draft.householdName || "Tu hogar"} ya tiene contexto suficiente
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
          El menu semanal podra partir de una base comun para {draft.memberCount}{" "}
          personas, con ajustes de racion por miembro.
        </p>
      </SectionCard>

      <SectionCard>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Miembros
        </p>
        <div className="mt-3 space-y-3">
          {draft.members.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl bg-[rgba(255,255,255,0.06)] px-4 py-3"
            >
              <p className="text-sm font-semibold text-[var(--color-paper)]">
                {member.name || "Sin nombre"}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {member.goal}
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Restricciones: {member.restrictions || "ninguna"}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                No le gusta: {member.dislikes || "sin notas"}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Preferencias del hogar
        </p>
        <div className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
          <p>Presupuesto semanal: {draft.weeklyBudget || "no definido"}</p>
          <p>Tiempo de cocina: {draft.cookingLoad}</p>
          <p>Supermercado habitual: {draft.preferredStore || "no definido"}</p>
          <p>
            Planificacion:{" "}
            {draft.repeatMode === "repeat-base-week"
              ? "repetir semana base"
              : "variar semana a semana"}
          </p>
        </div>
      </SectionCard>

      <Link
        href="/dashboard"
        className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-4 text-sm font-semibold text-slate-950"
      >
        Entrar al menu semanal
      </Link>
    </div>
  );
}
