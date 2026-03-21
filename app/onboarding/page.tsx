import { AppShell } from "@/components/layout/app-shell";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";
import { requireAuth } from "@/lib/auth/require-auth";
import { getHouseholdWithMembersByOwnerUserId } from "@/lib/dal/households";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const session = await requireAuth("/onboarding");
  const existingHousehold = await getHouseholdWithMembersByOwnerUserId(
    session.user.id,
  );

  if (existingHousehold) {
    redirect("/dashboard");
  }

  return (
    <AppShell currentPath="/onboarding" hideBottomNav>
      <OnboardingFlow userId={session.user.id} />
    </AppShell>
  );
}
