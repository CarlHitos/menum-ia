import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ShoppingListPageClient } from "@/features/shopping-list/shopping-list-page-client";
import { requireAuth } from "@/lib/auth/require-auth";
import { getHouseholdByOwnerUserId } from "@/lib/dal/households";
import {
  getLatestWeeklyPlanByHouseholdId,
  getShoppingListState,
} from "@/lib/dal/plans";
import { getCatalogRecipes } from "@/lib/server/recipes-catalog";

export default async function ShoppingListPage() {
  const session = await requireAuth("/shopping-list");
  const household = await getHouseholdByOwnerUserId(session.user.id);

  if (!household) {
    redirect("/onboarding");
  }

  const plan = await getLatestWeeklyPlanByHouseholdId(household.id);
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
