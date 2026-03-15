import Link from "next/link";

const items = [
  { href: "/", label: "Inicio" },
  { href: "/onboarding", label: "Hogar" },
  { href: "/dashboard", label: "Menu" },
  { href: "/shopping-list", label: "Compra" },
];

type BottomNavProps = {
  currentPath: string;
};

export function BottomNav({ currentPath }: BottomNavProps) {
  return (
    <nav className="fixed bottom-4 left-1/2 z-20 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-full border border-[var(--color-border)] bg-[rgba(15,24,42,0.72)] p-2 shadow-[var(--shadow-card)] backdrop-blur-xl">
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? currentPath === item.href
            : currentPath.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 rounded-full px-3 py-3 text-center text-sm transition ${
              isActive
                ? "bg-[var(--color-accent)] text-slate-950"
                : "text-[var(--color-muted)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
