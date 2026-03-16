import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatPill } from "@/components/ui/stat-pill";
import { householdSnapshot, weeklyPlanSummary } from "@/lib/mocks";

export default function HomePage() {
  return (
    <AppShell currentPath="/">
      <PageHeader
        eyebrow="MenumIA"
        title="Tu hogar en armonia"
        description="Volved a disfrutar de comer en casa."
        action={
          <Image
            src="/branding/Iconosintransparency.png"
            alt="Logo de MenumIA"
            width={52}
            height={52}
            className="h-11 w-11 rounded-2xl object-contain"
            priority
          />
        }
      />

      <SectionCard className="mb-4 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        <p className="text-base leading-7 text-[var(--color-paper)]">
          Olvida la improvisacion y los gastos de ultima hora en delivery.
          Planifica tu semana, llena tu nevera con lo que de verdad necesitas y
          asegura una alimentacion sana para todos.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/onboarding"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-3 text-center text-sm font-semibold text-slate-950"
          >
            Configurar mi hogar
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-3 text-center text-sm font-semibold text-[var(--color-paper)] transition hover:border-[rgba(252,163,17,0.4)] hover:bg-[rgba(252,163,17,0.12)] active:bg-[var(--color-accent)] active:text-slate-950"
          >
            Ver menu semanal
          </Link>
        </div>
      </SectionCard>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatPill label="Hogar" value={householdSnapshot.name} />
        <StatPill
          label="Semana"
          value={`${weeklyPlanSummary.totalSlots} comidas planificadas`}
        />
      </div>

      <SectionCard>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Bienvenida
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          MenumIA es el corazon de vuestra cocina. Organiza quien cocina, que
          toca hoy y genera la lista de la compra exacta para que nunca falte un
          ingrediente.
        </p>
      </SectionCard>

      <SectionCard className="mt-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          Tu nuevo ritmo de vida
        </p>
        <div className="mt-3 space-y-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-paper)]">
              Sincronizad vuestros gustos
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Configura quienes sois y que os gusta. MenumIA crea un plan que
              encaja con el estilo de vida de cada miembro del hogar.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--color-paper)]">
              Asegurad vuestra despensa
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Revisa el menu y genera la lista de la compra. Compra una sola
              vez a la semana y ten la tranquilidad de que siempre hay algo rico
              esperando en la nevera.
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--color-paper)]">
              Cocina sin estres
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Sigue los pasos con el temporizador integrado. Ahorra tiempo,
              dinero y salud cocinando con vuestra propia planificacion.
            </p>
          </div>
        </div>
      </SectionCard>
    </AppShell>
  );
}
