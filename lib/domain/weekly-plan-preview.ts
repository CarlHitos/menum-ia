import type { MealTag, MealType, Recipe, WeeklyPlan } from "@/lib/domain/types";

export type WeeklyPlanPreviewSlot = {
  id: string;
  mealType: MealType;
  mealLabel: string;
  status: "planned" | "empty";
  title: string;
  description: string;
  recipeId?: string;
  minutes?: number;
  badges: Array<{
    tag: MealTag;
    label: string;
    description: string;
  }>;
};

export type WeeklyPlanPreviewDay = {
  dayKey: string;
  shortLabel: string;
  dateLabel: string;
  fullDateLabel: string;
  activeSlots: number;
  slots: WeeklyPlanPreviewSlot[];
};

const mealTypeOrder: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

const mealTypeLabels: Record<MealType, string> = {
  breakfast: "Desayuno",
  lunch: "Comida",
  snack: "Snack / merienda",
  dinner: "Cena",
};

const tagLabels: Record<MealTag, string> = {
  "quick-dinner": "Cena rapida",
  "batch-friendly": "Cocinar para todos",
  "uses-leftovers": "Aprovecha sobras",
  "generates-leftovers": "Adelantar cena",
};

const tagDescriptions: Record<MealTag, string> = {
  "quick-dinner":
    "Pensada para esos dias en los que llegas a casa con el tiempo justo o la energia al minimo.",
  "batch-friendly":
    "Esta comida merece cocinar un poco mas porque deja trabajo adelantado para otros dias.",
  "uses-leftovers":
    "Este bloque reutiliza una base ya cocinada para ahorrar tiempo y reducir desperdicio.",
  "generates-leftovers":
    "Al cocinarla conviene guardar una parte porque ayuda a montar otras comidas de la semana.",
};

export function buildWeeklyPlanPreview(
  plan: WeeklyPlan,
  recipes: Recipe[],
  visibleMealTypes: MealType[] = mealTypeOrder,
): WeeklyPlanPreviewDay[] {
  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));

  return plan.days.map((day, index) => {
    const date = addDaysToDate(plan.rangeStart, index);
    const sortedSlots = [...day.slots]
      .filter((slot) => visibleMealTypes.includes(slot.mealType))
      .sort(
        (left, right) =>
          mealTypeOrder.indexOf(left.mealType) - mealTypeOrder.indexOf(right.mealType),
      );

    const slots = sortedSlots.map((slot) => {
      const recipe = recipeMap.get(slot.recipeId);

      if (!recipe) {
        return {
          id: slot.id,
          mealType: slot.mealType,
          mealLabel: mealTypeLabels[slot.mealType],
          status: "empty" as const,
          title: "Sin plan todavia",
          description: "Hueco libre para decidir mas adelante.",
          badges: [],
        };
      }

      return {
        id: slot.id,
        mealType: slot.mealType,
        mealLabel: mealTypeLabels[slot.mealType],
        status: "planned" as const,
        recipeId: recipe.id,
        title: recipe.title,
        minutes: recipe.durationMinutes,
        description: buildSlotDescription(slot.tags, recipe.description),
        badges: slot.tags.map((tag) => ({
          tag,
          label: tagLabels[tag],
          description: tagDescriptions[tag],
        })),
      };
    });

    return {
      dayKey: day.dayKey,
      shortLabel: day.label,
      dateLabel: formatDateShort(date),
      fullDateLabel: formatDateLong(date),
      activeSlots: slots.filter((slot) => slot.status === "planned").length,
      slots,
    };
  });
}

export function getWeeklyPlanSummary(plan: WeeklyPlan) {
  const totalSlots = plan.days.reduce((count, day) => count + day.slots.length, 0);
  const quickSlots = plan.days.reduce(
    (count, day) =>
      count +
      day.slots.filter((slot) => slot.tags.includes("quick-dinner")).length,
    0,
  );
  const leftoverSlots = plan.days.reduce(
    (count, day) =>
      count +
      day.slots.filter(
        (slot) =>
          slot.tags.includes("uses-leftovers") ||
          slot.tags.includes("generates-leftovers"),
      ).length,
    0,
  );

  return {
    totalSlots,
    quickSlots,
    prepDays: plan.batchBlocks.map((block) => block.plannedDay),
    prepLabels: plan.batchBlocks.map((block) => block.label),
    leftoverSlots,
  };
}

export function formatMealTypeLabel(mealType: MealType) {
  return mealTypeLabels[mealType];
}

export function getTagGuide() {
  return [
    {
      key: "batch-friendly",
      label: tagLabels["batch-friendly"],
      description: tagDescriptions["batch-friendly"],
    },
    {
      key: "uses-leftovers",
      label: tagLabels["uses-leftovers"],
      description: tagDescriptions["uses-leftovers"],
    },
    {
      key: "quick-dinner",
      label: tagLabels["quick-dinner"],
      description: tagDescriptions["quick-dinner"],
    },
  ];
}

function buildSlotDescription(tags: MealTag[], fallbackDescription: string) {
  if (tags.includes("batch-friendly")) {
    return "Ideal para cocinar de mas y dejar otra comida medio resuelta.";
  }

  if (tags.includes("uses-leftovers")) {
    return "Perfecta para aprovechar lo que ya teneis preparado.";
  }

  if (tags.includes("quick-dinner")) {
    return "Opcion ligera y sin complicaciones para resolver el dia.";
  }

  return fallbackDescription;
}

function addDaysToDate(dateString: string, days: number) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDateShort(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatDateLong(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}
