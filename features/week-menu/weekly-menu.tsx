import Link from "next/link";
import { SectionCard } from "@/components/ui/section-card";

type PlannedSlot = {
  mealType: string;
  status: "planned" | "empty";
  title: string;
  description: string;
  recipeId?: string;
  minutes?: number;
  tags?: string[];
};

type WeeklyMenuProps = {
  plan: Array<{
    dayKey: string;
    label: string;
    slots: PlannedSlot[];
  }>;
};

export function WeeklyMenu({ plan }: WeeklyMenuProps) {
  return (
    <div className="grid gap-3">
      {plan.map((day) => (
        <SectionCard key={day.dayKey}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-accent-soft)]">
                {day.label}
              </p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--color-paper)]">
                {day.slots.filter((slot) => slot.status === "planned").length} bloques activos
              </h3>
            </div>
            <span className="rounded-full border border-[var(--color-border)] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Comida + cena
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {day.slots.map((slot) => {
              const content = (
                <div
                  className={`rounded-2xl border px-4 py-4 transition ${
                    slot.status === "planned"
                      ? "border-[rgba(252,163,17,0.18)] bg-[rgba(255,255,255,0.06)]"
                      : "border-dashed border-[var(--color-border)] bg-[rgba(255,255,255,0.03)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        {slot.mealType === "lunch" ? "Comida" : "Cena"}
                      </p>
                      <h4 className="mt-2 text-base font-semibold text-[var(--color-paper)]">
                        {slot.title}
                      </h4>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">
                        {slot.description}
                      </p>
                    </div>
                    {slot.minutes ? (
                      <div className="rounded-2xl bg-[rgba(252,163,17,0.16)] px-3 py-2 text-right">
                        <p className="text-lg font-semibold text-[var(--color-accent)]">
                          {slot.minutes}
                        </p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                          min
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {slot.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {slot.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-[rgba(255,255,255,0.08)] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]"
                        >
                          {tag.replace(/-/g, " ")}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              );

              return slot.status === "planned" && slot.recipeId ? (
                <Link key={`${day.dayKey}-${slot.mealType}`} href={`/recipes/${slot.recipeId}`}>
                  {content}
                </Link>
              ) : (
                <div key={`${day.dayKey}-${slot.mealType}`}>{content}</div>
              );
            })}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
