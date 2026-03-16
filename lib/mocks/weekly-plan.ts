import type { WeeklyPlan } from "@/lib/domain/types";
import { weekTemplate } from "@/lib/mocks/week-template";

export const weeklyPlan: WeeklyPlan = {
  id: "plan-2026-03-16",
  householdId: "household-rivera",
  templateId: weekTemplate.id,
  status: "draft",
  planningStartMode: "next-monday",
  rangeStart: "2026-03-16",
  rangeEnd: "2026-03-22",
  weekStart: "2026-03-16",
  days: weekTemplate.days,
  batchBlocks: weekTemplate.batchBlocks,
  leftoverFlows: weekTemplate.leftoverFlows,
  updatedAt: "2026-03-16T09:00:00.000Z",
};
