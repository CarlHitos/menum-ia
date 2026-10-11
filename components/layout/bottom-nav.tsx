import Image from "next/image";
import Link from "next/link";

const items = [
  { href: "/", label: "Hogar", icon: "/branding/hogar.svg" },
  { href: "/dashboard", label: "Menu", icon: "/branding/meal.svg" },
  { href: "/recipes", label: "Recetas", icon: "/branding/meal.svg" },
  { href: "/shopping-list", label: "Compra", icon: "/branding/list.svg" },
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
            className={`flex flex-1 flex-col items-center justify-center gap-1.5 rounded-full px-3 py-2 text-center text-xs transition ${
              isActive
                ? "bg-[var(--color-accent)] text-slate-950"
                : "text-[var(--color-muted)]"
            }`}
          >
            <Image
              src={item.icon}
              alt=""
              width={24}
              height={24}
              className={`h-6 w-6 object-contain ${isActive ? "" : "opacity-85"}`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
