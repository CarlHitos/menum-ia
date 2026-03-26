import type { WeekTemplate } from "@/lib/domain/types";
import { weekTemplate as baseWeekTemplate } from "@/lib/data/base-week-template";

export function buildDefaultWeekTemplate(
  householdId: string,
  memberCount: number,
): WeekTemplate {
  const servings = Math.max(memberCount, 1);

  return {
    ...structuredClone(baseWeekTemplate),
    id: `template-${householdId}-base`,
    householdId,
    days: baseWeekTemplate.days.map((day) => ({
      ...structuredClone(day),
      slots: day.slots.map((slot) => ({
        ...structuredClone(slot),
        servings,
      })),
    })),
    batchBlocks: structuredClone(baseWeekTemplate.batchBlocks),
    leftoverFlows: structuredClone(baseWeekTemplate.leftoverFlows),
  };
}
