import type {
  PlanningStartMode,
  WeekTemplate,
  WeeklyPlan,
  WeeklyPlanStatus,
} from "@/lib/domain/types";

const weekdayOrder = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

type BuildActivePlanOptions = {
  householdId: string;
  planningStartMode: PlanningStartMode;
  referenceDate?: Date;
};

export function buildActivePlanFromTemplate(
  template: WeekTemplate,
  options: BuildActivePlanOptions,
): WeeklyPlan {
  const startDate = getPlanningStartDate(
    options.planningStartMode,
    options.referenceDate ?? new Date(),
  );
  const startDayKey = weekdayOrder[startDate.getDay()];
  const rotatedDays = rotateDaysFromKey(template.days, startDayKey).map((day) => ({
    ...day,
    label: formatWeekdayShortLabel(day.dayKey),
    slots: day.slots.map((slot) => ({
      ...slot,
      dayKey: day.dayKey,
    })),
  }));

  return {
    id: `plan-${startDate.toISOString().slice(0, 10)}`,
    householdId: options.householdId,
    templateId: template.id,
    status: "draft",
    planningStartMode: options.planningStartMode,
    rangeStart: startDate.toISOString().slice(0, 10),
    rangeEnd: addDays(startDate.toISOString().slice(0, 10), 6),
    weekStart: startDate.toISOString().slice(0, 10),
    days: rotatedDays,
    batchBlocks: structuredClone(template.batchBlocks),
    leftoverFlows: structuredClone(template.leftoverFlows),
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeWeeklyPlan(
  plan: WeeklyPlan,
  fallbackStartMode: PlanningStartMode = "next-monday",
): WeeklyPlan {
  const rangeStart = plan.rangeStart ?? plan.weekStart;
  const rangeEnd = plan.rangeEnd ?? addDays(rangeStart, 6);

  return {
    ...plan,
    status: plan.status ?? "draft",
    planningStartMode: plan.planningStartMode ?? fallbackStartMode,
    rangeStart,
    rangeEnd,
    updatedAt: plan.updatedAt ?? new Date().toISOString(),
  };
}

export function updateWeeklyPlanStatus(
  plan: WeeklyPlan,
  status: WeeklyPlanStatus,
): WeeklyPlan {
  return {
    ...plan,
    status,
    confirmedAt: status === "confirmed" ? new Date().toISOString() : plan.confirmedAt,
    updatedAt: new Date().toISOString(),
  };
}

export function getPlanRangeLabel(plan: WeeklyPlan) {
  return `${formatDateLabel(plan.rangeStart)} - ${formatDateLabel(plan.rangeEnd)}`;
}

export function getPlanningStartDate(
  planningStartMode: PlanningStartMode,
  referenceDate: Date = new Date(),
) {
  const normalizedReference = new Date(referenceDate);
  normalizedReference.setHours(12, 0, 0, 0);

  if (planningStartMode === "today") {
    return normalizedReference;
  }

  const weekday = normalizedReference.getDay();
  const daysUntilNextMonday = weekday === 1 ? 7 : (8 - weekday) % 7;
  const nextMonday = new Date(normalizedReference);
  nextMonday.setDate(nextMonday.getDate() + daysUntilNextMonday);
  return nextMonday;
}

function rotateDaysFromKey(
  days: WeekTemplate["days"],
  startDayKey: string,
) {
  const startIndex = days.findIndex((day) => day.dayKey === startDayKey);

  if (startIndex === -1) {
    return structuredClone(days);
  }

  return structuredClone([...days.slice(startIndex), ...days.slice(0, startIndex)]);
}

function addDays(dateString: string, days: number) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatWeekdayShortLabel(dayKey: string) {
  switch (dayKey) {
    case "monday":
      return "Lun";
    case "tuesday":
      return "Mar";
    case "wednesday":
      return "Mie";
    case "thursday":
      return "Jue";
    case "friday":
      return "Vie";
    case "saturday":
      return "Sab";
    case "sunday":
      return "Dom";
    default:
      return dayKey;
  }
}
