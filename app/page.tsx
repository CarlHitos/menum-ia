import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getHouseholdWithMembersByOwnerUserId } from "@/lib/dal/households";
import { buildHouseholdFromPersistence } from "@/lib/domain/household-mappers";
import type { Household } from "@/lib/domain/types";

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
        title={household ? "Planificacion activa" : "Tu hogar en armonIA"}
        action={
          <Image
            src="/branding/IconosintransparencyIA.png"
            alt="Logo de MenumIA"
            width={52}
            height={52}
            className="h-11 w-11 rounded-2xl object-contain"
            priority
          />
        }
      />
      <SectionCard>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {household ? `Resumen del hogar: ${household.name}` : "Bienvenida"}
        </p>
        {household ? (
          <>
            <h2 className="mt-2 text-lg font-semibold text-[var(--color-paper)]">
              {buildHouseholdSummary(household)}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {household.members.map((member) => (
                <span
                  key={member.id}
                  className="inline-flex items-center gap-2 rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-2 text-sm text-[var(--color-paper)]"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(252,163,17,0.16)] text-xs font-semibold text-[var(--color-accent)]">
                    {getInitials(member.name)}
                  </span>
                  {member.name}
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
              <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-2">
                {formatCookingLoad(household.planningPreferences.cookingLoad)}
              </span>
              <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-2">
                {household.planningPreferences.repeatMode === "repeat-base-week"
                  ? "Semana base repetible"
                  : "Semana variable"}
              </span>
              <span className="rounded-full bg-[rgba(255,255,255,0.06)] px-3 py-2">
                {formatGoalSummary(
                  household.members.map((member) => member.goal),
                  household.members.length,
                )}
              </span>
            </div>
          </>
        ) : (
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            MenumIA es el corazon de tu cocina. Organiza quien cocina, que
            toca hoy y genera la lista de la compra exacta para que nunca falte
            un ingrediente. Olvida la improvisacion y los gastos de ultima hora
            en delivery
          </p>
        )}
      </SectionCard>

      <SectionCard className="mt-4 mb-4 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
        {household ? (
          <>
            <p className="text-base leading-7 text-[var(--color-paper)]">
              Ya tienes el hogar configurado. Desde aqui puedes entrar al menu
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
              Primero configura tu hogar para que MenumIA pueda preparar un
              menu y una compra que de verdad encajen contigo.
            </p>
            <div className="mt-4 flex justify-center">
              <Link
                href={setupHref}
                className="inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-3 text-center text-sm font-semibold text-slate-950"
              >
                Configurar mi hogar
              </Link>
            </div>
          </>
        )}
      </SectionCard>

      {household ? (
        <SectionCard className="mt-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
            Que viene ahora
          </p>
          <div className="mt-3 space-y-3">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-paper)]">
                Menu semanal accionable
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Entra al menu para materializar tu semana activa y ajustar
                recetas antes de pasar a la compra.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-paper)]">
                Compra derivada del menu
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                Cuando la semana este lista, la lista de compra se generara
                desde tu plan real, no desde una demo.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-[var(--color-paper)]">
                Edicion del hogar
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                En una siguiente fase podras editar miembros, presupuesto y
                preferencias del hogar desde esta misma seccion.
              </p>
            </div>
          </div>
        </SectionCard>
      ) : null}
    </AppShell>
  );
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function buildHouseholdSummary(household: Household) {
  const parts = ["Menu optimizado y listo para ajustar"];
  const preferredStore = household.planningPreferences.preferredStores[0];
  const weeklyBudget = household.planningPreferences.weeklyBudget;

  if (preferredStore) {
    parts.push(`compra pensada para ${preferredStore}`);
  }

  if (weeklyBudget) {
    parts.push(`presupuesto objetivo ${weeklyBudget}€`);
  }

  return `${parts.join(". ")}.`;
}

function formatCookingLoad(value: "low" | "medium" | "high") {
  switch (value) {
    case "low":
      return "Muy poco tiempo";
    case "medium":
      return "30 min aprox.";
    case "high":
      return "Mas margen para cocinar";
  }
}

function formatGoalSummary(goals: string[], memberCount: number) {
  const uniqueGoals = Array.from(new Set(goals));

  if (uniqueGoals.length === 1) {
    return memberCount === 1
      ? `Objetivo principal: ${formatGoalLabel(uniqueGoals[0])}`
      : `Objetivo compartido: ${formatGoalLabel(uniqueGoals[0])}`;
  }

  return `Objetivos mixtos: ${uniqueGoals.map(formatGoalLabel).join(", ")}`;
}

function formatGoalLabel(goal: string) {
  switch (goal) {
    case "gain":
      return "💪 Ganar fuerza";
    case "lose":
      return "🔥 Perder peso";
    case "maintain":
      return "⚖️ Mantenerse";
    case "eat-better":
      return "🥗 Comer mejor";
    default:
      return goal;
  }
}
