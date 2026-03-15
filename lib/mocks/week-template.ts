import type { WeekTemplate } from "@/lib/domain/types";

export const weekTemplate: WeekTemplate = {
  id: "template-base-semanal",
  householdId: "household-rivera",
  name: "Semana base familiar",
  repeatable: true,
  days: [
    {
      dayKey: "monday",
      label: "Lun",
      slots: [
        {
          id: "mon-lunch",
          mealType: "lunch",
          recipeId: "arroz-pollo-verduras",
          dayKey: "monday",
          servings: 3,
          tags: ["batch-friendly", "generates-leftovers"],
        },
        {
          id: "mon-dinner",
          mealType: "dinner",
          recipeId: "tortilla-calabacin",
          dayKey: "monday",
          servings: 3,
          tags: ["quick-dinner"],
        },
      ],
    },
    {
      dayKey: "tuesday",
      label: "Mar",
      slots: [
        {
          id: "tue-lunch",
          mealType: "lunch",
          recipeId: "lentejas-verduras-arroz",
          dayKey: "tuesday",
          servings: 3,
          tags: [],
        },
        {
          id: "tue-dinner",
          mealType: "dinner",
          recipeId: "wraps-pollo",
          dayKey: "tuesday",
          servings: 3,
          tags: ["quick-dinner", "uses-leftovers"],
        },
      ],
    },
    {
      dayKey: "wednesday",
      label: "Mie",
      slots: [
        {
          id: "wed-lunch",
          mealType: "lunch",
          recipeId: "pasta-carne-tomate",
          dayKey: "wednesday",
          servings: 3,
          tags: ["batch-friendly", "generates-leftovers"],
        },
        {
          id: "wed-dinner",
          mealType: "dinner",
          recipeId: "crema-verduras-tostadas-atun",
          dayKey: "wednesday",
          servings: 3,
          tags: ["quick-dinner"],
        },
      ],
    },
    {
      dayKey: "thursday",
      label: "Jue",
      slots: [
        {
          id: "thu-lunch",
          mealType: "lunch",
          recipeId: "merluza-patata-brocoli",
          dayKey: "thursday",
          servings: 3,
          tags: [],
        },
        {
          id: "thu-dinner",
          mealType: "dinner",
          recipeId: "ensalada-garbanzos-huevo",
          dayKey: "thursday",
          servings: 3,
          tags: ["quick-dinner"],
        },
      ],
    },
    {
      dayKey: "friday",
      label: "Vie",
      slots: [
        {
          id: "fri-lunch",
          mealType: "lunch",
          recipeId: "salteado-arroz-pavo",
          dayKey: "friday",
          servings: 3,
          tags: ["uses-leftovers"],
        },
        {
          id: "fri-dinner",
          mealType: "dinner",
          recipeId: "pizza-casera-rapida",
          dayKey: "friday",
          servings: 3,
          tags: ["quick-dinner", "uses-leftovers"],
        },
      ],
    },
    {
      dayKey: "saturday",
      label: "Sab",
      slots: [
        {
          id: "sat-lunch",
          mealType: "lunch",
          recipeId: "albondigas-pure",
          dayKey: "saturday",
          servings: 3,
          tags: [],
        },
        {
          id: "sat-dinner",
          mealType: "dinner",
          recipeId: "bocadillos-ensalada",
          dayKey: "saturday",
          servings: 3,
          tags: ["quick-dinner"],
        },
      ],
    },
    {
      dayKey: "sunday",
      label: "Dom",
      slots: [
        {
          id: "sun-lunch",
          mealType: "lunch",
          recipeId: "pollo-boniato-ensalada",
          dayKey: "sunday",
          servings: 3,
          tags: ["batch-friendly", "generates-leftovers"],
        },
        {
          id: "sun-dinner",
          mealType: "dinner",
          recipeId: "cena-aprovechamiento",
          dayKey: "sunday",
          servings: 3,
          tags: ["quick-dinner", "uses-leftovers"],
        },
      ],
    },
  ],
  batchBlocks: [
    {
      id: "batch-sunday",
      label: "Batch del domingo",
      plannedDay: "sunday",
      produces: [
        { id: "batch-rice", name: "Arroz cocido", quantity: 700, unit: "g", expiresInDays: 3 },
        { id: "batch-chicken", name: "Pollo cocinado", quantity: 700, unit: "g", expiresInDays: 3 },
        { id: "batch-veg", name: "Verduras asadas", quantity: 600, unit: "g", expiresInDays: 3 },
      ],
      feedsMealSlotIds: ["mon-lunch", "tue-dinner", "fri-lunch"],
    },
    {
      id: "batch-wednesday",
      label: "Batch del miercoles",
      plannedDay: "wednesday",
      produces: [
        { id: "batch-meat-sauce", name: "Salsa de carne", quantity: 500, unit: "g", expiresInDays: 3 },
      ],
      feedsMealSlotIds: ["wed-lunch", "fri-dinner"],
    },
  ],
};
