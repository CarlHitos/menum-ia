import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatPill } from "@/components/ui/stat-pill";
import { getHouseholdWithMembersByOwnerUserId } from "@/lib/dal/households";
import { buildHouseholdFromPersistence } from "@/lib/domain/household-mappers";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const persistedHousehold = session?.user?.id
    ? await getHouseholdWithMembersByOwnerUserId(session.user.id)
    : null;
  const household = persistedHousehold
    ? buildHouseholdFromPersistence(
        persistedHousehold.household,
        persistedHousehold.members,
      )
    : null;
  const setupHref = session?.user?.id
    ? "/onboarding"
    : "/login?callbackUrl=%2Fonboarding";

  return (
    <AppShell currentPath="/" hideBottomNav={!household}>
      <PageHeader
        eyebrow="MenumIA"
        title={
          household ? `Vuestro hogar: ${household.name}` : "Tu hogar en armonia"
        }
        description={
          household
            ? "Todo listo para organizar el menu, ajustar la compra y cocinar con menos friccion."
            : "Planificad vuestra semana, comprad con criterio y cocinad con mucha menos friccion."
        }
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
        {household ? (
          <>
            <p className="text-base leading-7 text-[var(--color-paper)]">
              Ya teneis el hogar configurado. Desde aqui podeis entrar al menu
              semanal y, mas adelante, editar miembros, presupuesto y
              preferencias sin rehacer el onboarding.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-3 text-center text-sm font-semibold text-slate-950"
              >
                Ver menu semanal
              </Link>
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-border)] px-4 py-3 text-center text-sm font-semibold text-[var(--color-muted)] opacity-70"
              >
                Editar mi hogar
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-base leading-7 text-[var(--color-paper)]">
              Olvida la improvisacion y los gastos de ultima hora en delivery.
              Primero configurad vuestro hogar para que MenumIA pueda preparar
              un menu y una compra que de verdad encajen con vosotros.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href={setupHref}
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-3 text-center text-sm font-semibold text-slate-950"
              >
                Configurar mi hogar
              </Link>
            </div>
          </>
        )}
      </SectionCard>

      {household ? (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <StatPill label="Hogar" value={household.name} />
          <StatPill
            label="Miembros"
            value={`${household.members.length} personas`}
          />
        </div>
      ) : null}

      <SectionCard>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {household ? "Resumen del hogar" : "Bienvenida"}
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          {household
            ? `Supermercado habitual: ${
                household.planningPreferences.preferredStores[0] ?? "sin definir"
              }. Presupuesto semanal: ${
                household.planningPreferences.weeklyBudget
                  ? `${household.planningPreferences.weeklyBudget}€`
                  : "sin definir"
              }.`
            : "MenumIA es el corazon de vuestra cocina. Organiza quien cocina, que toca hoy y genera la lista de la compra exacta para que nunca falte un ingrediente."}
        </p>
      </SectionCard>

      <SectionCard className="mt-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {household ? "Que viene ahora" : "Tu nuevo ritmo de vida"}
        </p>
        <div className="mt-3 space-y-3">
          <div>
            <h2 className="text-base font-semibold text-[var(--color-paper)]">
              {household ? "Menu semanal accionable" : "Sincronizad vuestros gustos"}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {household
                ? "Entrad al menu para materializar vuestra semana activa y ajustar recetas antes de pasar a la compra."
                : "Configura quienes sois y que os gusta. MenumIA crea un plan que encaja con el estilo de vida de cada miembro del hogar."}
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--color-paper)]">
              {household ? "Compra derivada del menu" : "Asegurad vuestra despensa"}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {household
                ? "Cuando la semana este lista, la lista de compra se generara desde vuestro plan real, no desde una demo."
                : "Revisa el menu y genera la lista de la compra. Compra una sola vez a la semana y ten la tranquilidad de que siempre hay algo rico esperando en la nevera."}
            </p>
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--color-paper)]">
              {household ? "Edicion del hogar" : "Cocina sin estres"}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {household
                ? "En una siguiente fase podreis editar miembros, presupuesto y preferencias del hogar desde esta misma seccion."
                : "Sigue los pasos con el temporizador integrado. Ahorra tiempo, dinero y salud cocinando con vuestra propia planificacion."}
            </p>
          </div>
        </div>
      </SectionCard>
    </AppShell>
  );
}
