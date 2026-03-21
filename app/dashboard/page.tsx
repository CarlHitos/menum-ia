import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardClient } from "@/features/dashboard/dashboard-client";
import { requireAuth } from "@/lib/auth/require-auth";
import { getHouseholdWithMembersByOwnerUserId } from "@/lib/dal/households";
import { buildHouseholdFromPersistence } from "@/lib/domain/household-mappers";

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

  return (
    <AppShell currentPath="/dashboard">
      <PageHeader
        eyebrow=""
        title="Vuestra semana, lista"
        description="Preparad vuestra semana activa, ajustad recetas y pasad a la compra cuando este lista."
      />
      <DashboardClient household={household} userId={session.user.id} />
    </AppShell>
  );
}
