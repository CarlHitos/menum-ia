import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { DashboardClient } from "@/features/dashboard/dashboard-client";
import { household } from "@/lib/mocks";

export default function DashboardPage() {
  return (
    <AppShell currentPath="/dashboard">
      <PageHeader
        eyebrow="Dashboard"
        title="Menu semanal"
        description="Semana base visible de lunes a domingo con comidas y cenas clickables."
      />
      <DashboardClient household={household} />
    </AppShell>
  );
}
