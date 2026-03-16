import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardClient } from "@/features/dashboard/dashboard-client";
import { household } from "@/lib/mocks";

export default function DashboardPage() {
  return (
    <AppShell currentPath="/dashboard">
      <PageHeader
        eyebrow=""
        title="Vuestra semana, lista"
        description="El plan de hoy ya esta preparado para que solo tengais que ajustar, comprar y cocinar."
      />
      <DashboardClient household={household} />
    </AppShell>
  );
}
