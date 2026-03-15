export type Goal = "gain" | "lose" | "maintain" | "eat-better";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type IngredientCategory =
  | "protein"
  | "legumes"
  | "carbs"
  | "vegetables"
  | "fruit"
  | "fats-basics"
  | "dairy-drinks";

export type MealTag =
  | "quick-dinner"
  | "batch-friendly"
  | "uses-leftovers"
  | "generates-leftovers";

export type Household = {
  id: string;
  name: string;
  planningPreferences: {
    mealsPerDay: MealType[];
    weeklyBudget?: number;
    cookingLoad: "low" | "medium" | "high";
    repeatMode: "repeat-base-week" | "vary-week";
    preferredStores: string[];
  };
  members: HouseholdMember[];
};

export type HouseholdMember = {
  id: string;
  name: string;
  age?: number;
  goal: Goal;
  restrictions: string[];
  allergies: string[];
  dislikes: string[];
  portionProfile: "small" | "medium" | "large";
  snackProfile?: "none" | "standard" | "extra";
};

export type RecipeIngredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  scalable: boolean;
  componentRef?: string;
};

export type RecipeStep = {
  id: string;
  title: string;
  detail: string;
  timerSeconds?: number;
  checklist?: string[];
};

export type PortionAdjustment = {
  id: string;
  memberId: string;
  ingredientId: string;
  deltaQuantity: number;
  unit: string;
  note?: string;
};

export type ProducedComponent = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiresInDays?: number;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  category: MealType;
  durationMinutes: number;
  difficulty: "easy" | "medium";
  baseServings: number;
  utensils: string[];
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  substitutions: string[];
  portionAdjustments: PortionAdjustment[];
  batchCookingNotes?: string;
  leftoverNotes?: string;
  quickDinner?: boolean;
  baseYield?: ProducedComponent[];
};

export type MealSlot = {
  id: string;
  mealType: MealType;
  recipeId: string;
  dayKey: string;
  servings: number;
  tags: MealTag[];
  notes?: string;
};

export type PlannedDay = {
  dayKey: string;
  label: string;
  slots: MealSlot[];
};

export type BatchCookingBlock = {
  id: string;
  label: string;
  plannedDay: string;
  produces: ProducedComponent[];
  feedsMealSlotIds: string[];
};

export type LeftoverFlow = {
  sourceMealSlotId: string;
  producedComponentId: string;
  targetMealSlotId: string;
  note?: string;
};

export type WeekTemplate = {
  id: string;
  householdId: string;
  name: string;
  repeatable: boolean;
  days: PlannedDay[];
  batchBlocks: BatchCookingBlock[];
};

export type WeeklyPlan = {
  id: string;
  householdId: string;
  templateId?: string;
  weekStart: string;
  days: PlannedDay[];
  batchBlocks: BatchCookingBlock[];
  leftoverFlows: LeftoverFlow[];
};

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
  sourceRecipeIds: string[];
  sourceMealSlotIds: string[];
  manual?: boolean;
};

export type ShoppingCategory = {
  key: IngredientCategory;
  label: string;
  items: ShoppingItem[];
};

export type ShoppingList = {
  planId: string;
  categories: ShoppingCategory[];
};
