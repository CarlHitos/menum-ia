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
        titleSize="small"
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
        <p className="text-sm leading-6 text-[var(--color-paper)]">
          MenumIA Organiza los menús de toda la familia, genera tu lista de la compra automática y despídete de la improvisación (y del Delivery😉)
        </p>
      </SectionCard>

      <Link
        href={setupHref}
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-accent)] px-4 py-3 text-center text-sm font-semibold text-slate-950"
      >
        <span className="text-slate-950">Empezar</span>
      </Link>
    </AppShell>
  );
}
