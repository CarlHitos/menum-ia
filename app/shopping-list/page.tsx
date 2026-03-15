import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { ShoppingListClient } from "@/features/shopping-list/shopping-list-client";
import { shoppingList } from "@/lib/mocks";

export default function ShoppingListPage() {
  return (
    <AppShell currentPath="/shopping-list">
      <PageHeader
        eyebrow="Compra"
        title="Lista semanal agregada"
        description="Compra derivada de toda la semana base, agrupada por categorias y lista para marcar."
      />

      <SectionCard className="mb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Cobertura semanal
            </p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--color-paper)]">
              Comidas y cenas de lunes a domingo
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Ingredientes agregados desde batch cooking, sobras y cenas rapidas.
            </p>
          </div>
          <Link
            href="/cook/wraps-pollo"
            className="rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Cocinar
          </Link>
        </div>
      </SectionCard>

      <ShoppingListClient categories={shoppingList.categories} />
    </AppShell>
  );
}
