import type { WeeklyPlan } from "@/lib/domain/types";
import { weekTemplate } from "@/lib/mocks/week-template";

export const weeklyPlan: WeeklyPlan = {
  id: "plan-2026-03-16",
  householdId: "household-rivera",
  templateId: weekTemplate.id,
  weekStart: "2026-03-16",
  days: weekTemplate.days,
  batchBlocks: weekTemplate.batchBlocks,
  leftoverFlows: [
    {
      sourceMealSlotId: "mon-lunch",
      producedComponentId: "batch-chicken",
      targetMealSlotId: "tue-dinner",
      note: "El pollo del lunes alimenta los wraps del martes.",
    },
    {
      sourceMealSlotId: "mon-lunch",
      producedComponentId: "batch-rice",
      targetMealSlotId: "fri-lunch",
      note: "Parte del arroz cocido se reutiliza en el salteado.",
    },
    {
      sourceMealSlotId: "mon-lunch",
      producedComponentId: "batch-veg",
      targetMealSlotId: "fri-lunch",
      note: "Las verduras asadas reducen tiempo el viernes.",
    },
    {
      sourceMealSlotId: "wed-lunch",
      producedComponentId: "batch-meat-sauce",
      targetMealSlotId: "fri-dinner",
      note: "La salsa de carne acelera la pizza rapida del viernes.",
    },
    {
      sourceMealSlotId: "sun-lunch",
      producedComponentId: "batch-sunday-chicken",
      targetMealSlotId: "sun-dinner",
      note: "El pollo del domingo ayuda a resolver la cena de aprovechamiento.",
    },
  ],
};
