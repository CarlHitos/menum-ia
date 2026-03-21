import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ShoppingListPageClient } from "@/features/shopping-list/shopping-list-page-client";
import { requireAuth } from "@/lib/auth/require-auth";
import { getHouseholdByOwnerUserId } from "@/lib/dal/households";

export default async function ShoppingListPage() {
  const session = await requireAuth("/shopping-list");
  const household = await getHouseholdByOwnerUserId(session.user.id);

  if (!household) {
    redirect("/onboarding");
  }

  return (
    <AppShell currentPath="/shopping-list">
      <ShoppingListPageClient userId={session.user.id} />
    </AppShell>
  );
}
