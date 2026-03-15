import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatPill } from "@/components/ui/stat-pill";
import { householdSnapshot, weeklyPlanPreview } from "@/lib/mocks";

export default function HomePage() {
  return (
    <AppShell currentPath="/">
      <PageHeader
        eyebrow="MVP"
        title="Planifica la semana sin friccion"
        description="Una base moderna para onboarding del hogar, menu clickable, lista de compra y modo cocinar."
        action={
          <div className="rounded-full border border-[var(--color-border)] bg-[rgba(255,255,255,0.08)] px-3 py-2 text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
            App Router
          </div>
        }
      />

      <SectionCard className="mb-4 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <p className="text-sm leading-6 text-[var(--color-paper)]">
          Menumia organiza el ritmo semanal del hogar desde el movil: quien
          cocina, que toca hoy y que falta por comprar.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/onboarding"
            className="rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Empezar onboarding
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-[var(--color-border)] px-4 py-3 text-sm font-semibold text-[var(--color-paper)]"
          >
            Ver menu
          </Link>
        </div>
      </SectionCard>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatPill label="Hogar" value={householdSnapshot.name} />
        <StatPill label="Cenas" value={`${weeklyPlanPreview.length} base esta semana`} />
      </div>

      <SectionCard>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Flujo MVP
        </p>
        <div className="mt-3 space-y-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-paper)]">
              1. Configura el hogar
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Define miembros, preferencias y estilo de cocina.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--color-paper)]">
              2. Revisa el menu semanal
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Cada dia enlaza al modo cocinar correspondiente.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--color-paper)]">
              3. Compra y cocina
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Marca la compra y sigue los pasos con timer integrado.
            </p>
          </div>
        </div>
      </SectionCard>
    </AppShell>
  );
}
