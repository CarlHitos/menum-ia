import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";
import { household } from "@/lib/mocks";

export default function OnboardingPage() {
  return (
    <AppShell currentPath="/onboarding">
      <PageHeader
        eyebrow="Onboarding"
        title="Configura tu hogar"
        description="Un flujo claro para recoger el contexto del hogar antes de planificar la semana."
      />
      <OnboardingFlow initialHousehold={household} />
    </AppShell>
  );
}
