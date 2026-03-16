import { AppShell } from "@/components/layout/app-shell";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";
import { household } from "@/lib/mocks";

export default function OnboardingPage() {
  return (
    <AppShell currentPath="/onboarding" hideBottomNav>
      <OnboardingFlow initialHousehold={household} />
    </AppShell>
  );
}
