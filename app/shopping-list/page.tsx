import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ShoppingListPageClient } from "@/features/shopping-list/shopping-list-page-client";
import { requireAuth } from "@/lib/auth/require-auth";
import { getHouseholdWithMembersByOwnerUserId } from "@/lib/dal/households";
import { buildHouseholdFromPersistence } from "@/lib/domain/household-mappers";
import { applyHouseholdToPlan } from "@/lib/domain/plan-servings";
import {
  getLatestWeeklyPlanByHouseholdId,
  getShoppingListState,
} from "@/lib/dal/plans";
import { getCatalogRecipes } from "@/lib/server/recipes-catalog";

export default async function ShoppingListPage() {
  const session = await requireAuth("/shopping-list");
  const persistedHousehold = await getHouseholdWithMembersByOwnerUserId(session.user.id);

  if (!persistedHousehold) {
    redirect("/onboarding");
  }

  const household = buildHouseholdFromPersistence(persistedHousehold.household, persistedHousehold.members);
  const storedPlan = await getLatestWeeklyPlanByHouseholdId(household.id);
  const plan = storedPlan ? applyHouseholdToPlan(storedPlan, household) : null;
  const shoppingState = plan ? await getShoppingListState(plan.id) : null;
  const recipes = await getCatalogRecipes();

  return (
    <AppShell currentPath="/shopping-list">
      <ShoppingListPageClient
        initialPlan={plan}
        initialShoppingState={shoppingState}
        recipes={recipes}
      />
    </AppShell>
  );
}
