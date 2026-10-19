import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { authOptions } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getHouseholdWithMembersByOwnerUserId } from "@/lib/dal/households";
import { buildHouseholdFromPersistence } from "@/lib/domain/household-mappers";
import { HomeSummary } from "@/features/home/home-summary";
import { buildHomeSummary } from "@/features/home/home-summary-data";
import { getLatestWeeklyPlanByHouseholdId, getShoppingListState } from "@/lib/dal/plans";
import { getCatalogRecipes } from "@/lib/server/recipes-catalog";

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
  if (household) {
    const plan = await getLatestWeeklyPlanByHouseholdId(household.id);
    const [recipes, shoppingState] = plan ? await Promise.all([
      getCatalogRecipes(),
      getShoppingListState(plan.id),
    ]) : [[], null];
    const summary = buildHomeSummary(household, plan, recipes, shoppingState);

    return (
      <AppShell currentPath="/" framed={false}>
        <HomeSummary household={household} userName={session?.user?.name} summary={summary} />
      </AppShell>
    );
  }

  const setupHref = session?.user?.id
    ? "/onboarding"
    : "/login?callbackUrl=%2Fonboarding";

  return (
    <AppShell currentPath="/" hideBottomNav>
      <PageHeader
        eyebrow="MenumIA"
        title="Tu hogar en armonIA"
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
          Bienvenida
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
          MenumIA es el corazon de tu cocina. Organiza quien cocina, que
          toca hoy y genera la lista de la compra exacta para que nunca falte
          un ingrediente. Olvida la improvisacion y los gastos de ultima hora
          en delivery
        </p>
      </SectionCard>

      <SectionCard className="mt-4 mb-4 bg-[linear-gradient(145deg,rgba(255,255,255,0.14),rgba(252,163,17,0.12))]">
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
      </SectionCard>
    </AppShell>
  );
}
