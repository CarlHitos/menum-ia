import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardClient } from "@/features/dashboard/dashboard-client";
import { requireAuth } from "@/lib/auth/require-auth";
import { getHouseholdWithMembersByOwnerUserId } from "@/lib/dal/households";
import {
  getLatestWeeklyPlanByHouseholdId,
  getWeekTemplateByHouseholdId,
  saveWeekTemplate,
} from "@/lib/dal/plans";
import { buildDefaultWeekTemplate } from "@/lib/domain/default-week-template";
import { buildHouseholdFromPersistence } from "@/lib/domain/household-mappers";
import { getCatalogRecipes } from "@/lib/server/recipes-catalog";
import { resolvePlanServings } from "@/lib/domain/plan-servings";

export default async function DashboardPage() {
  const session = await requireAuth("/dashboard");
  const persistedHousehold = await getHouseholdWithMembersByOwnerUserId(
    session.user.id,
  );

  if (!persistedHousehold) {
    redirect("/onboarding");
  }

  const household = buildHouseholdFromPersistence(
    persistedHousehold.household,
    persistedHousehold.members,
  );
  const existingTemplate = await getWeekTemplateByHouseholdId(household.id);
  const weekTemplate =
    existingTemplate ??
    (await saveWeekTemplate(
      buildDefaultWeekTemplate(household.id, household.members.length),
    ));
  const initialPlan = await getLatestWeeklyPlanByHouseholdId(household.id);
  const recipes = await getCatalogRecipes();

  return (
    <AppShell currentPath="/dashboard">
      <PageHeader
        eyebrow=""
        title="Plan semanal"
        description="Prepara tu semana activa, ajusta recetas y pasa a la compra cuando este lista."
      />
      <DashboardClient
        household={household}
        weekTemplate={weekTemplate}
        initialPlan={initialPlan ? resolvePlanServings(initialPlan, household) : null}
        recipes={recipes}
      />
    </AppShell>
  );
}
