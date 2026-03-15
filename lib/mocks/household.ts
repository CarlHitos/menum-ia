import type { Household } from "@/lib/domain/types";

export const household: Household = {
  id: "household-rivera",
  name: "Casa Rivera",
  planningPreferences: {
    mealsPerDay: ["breakfast", "lunch", "dinner", "snack"],
    weeklyBudget: 135,
    cookingLoad: "medium",
    repeatMode: "repeat-base-week",
    preferredStores: ["Mercadona", "Lidl"],
  },
  members: [
    {
      id: "carlos",
      name: "Carlos",
      goal: "gain",
      restrictions: [],
      allergies: [],
      dislikes: [],
      portionProfile: "large",
      snackProfile: "extra",
    },
    {
      id: "mandy",
      name: "Mandy",
      goal: "lose",
      restrictions: [],
      allergies: [],
      dislikes: [],
      portionProfile: "small",
      snackProfile: "standard",
    },
    {
      id: "sergi",
      name: "Sergi",
      goal: "maintain",
      restrictions: [],
      allergies: [],
      dislikes: [],
      portionProfile: "medium",
      snackProfile: "standard",
    },
  ],
};
