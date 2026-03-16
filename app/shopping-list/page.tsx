import { AppShell } from "@/components/layout/app-shell";
import { ShoppingListPageClient } from "@/features/shopping-list/shopping-list-page-client";

export default function ShoppingListPage() {
  return (
    <AppShell currentPath="/shopping-list">
      <ShoppingListPageClient />
    </AppShell>
  );
}
