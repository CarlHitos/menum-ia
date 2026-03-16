import { getIngredientAdjustmentTotal } from "@/lib/domain/portioning";
import type {
  IngredientCategory,
  Recipe,
  ShoppingCategory,
  ShoppingItem,
  WeeklyPlan,
} from "@/lib/domain/types";

const categoryLabels: Record<IngredientCategory, string> = {
  protein: "Proteinas",
  legumes: "Legumbres",
  carbs: "Cereales y carbohidratos",
  vegetables: "Verduras y hortalizas",
  fruit: "Fruta",
  "fats-basics": "Condimentos y basicos",
  "dairy-drinks": "Lacteos / bebidas",
};

const categoryOrder: IngredientCategory[] = [
  "protein",
  "legumes",
  "carbs",
  "vegetables",
  "fruit",
  "fats-basics",
  "dairy-drinks",
];

export function buildShoppingListFromPlan(plan: WeeklyPlan, recipes: Recipe[]) {
  const bucket = new Map<string, ShoppingItem & { category: IngredientCategory }>();
  const recipeMap = new Map(recipes.map((recipe) => [recipe.id, recipe]));

  for (const day of plan.days) {
    for (const slot of day.slots) {
      const recipe = recipeMap.get(slot.recipeId);

      if (!recipe) {
        continue;
      }

      const servingsFactor = slot.servings / recipe.baseServings;

      for (const ingredient of recipe.ingredients) {
        const baseQuantity = ingredient.quantity * servingsFactor;
        const adjustmentTotal = getIngredientAdjustmentTotal(
          ingredient,
          recipe.portionAdjustments,
        );
        const quantity = Number((baseQuantity + adjustmentTotal).toFixed(2));
        const key = `${ingredient.category}:${ingredient.name}:${ingredient.unit}`;
        const existing = bucket.get(key);

        if (existing) {
          existing.quantity = Number((existing.quantity + quantity).toFixed(2));
          existing.sourceRecipeIds = [...new Set([...existing.sourceRecipeIds, recipe.id])];
          existing.sourceMealSlotIds = [
            ...new Set([...existing.sourceMealSlotIds, slot.id]),
          ];
          continue;
        }

        bucket.set(key, {
          id: key,
          name: ingredient.name,
          quantity,
          unit: ingredient.unit,
          checked: false,
          sourceRecipeIds: [recipe.id],
          sourceMealSlotIds: [slot.id],
          category: ingredient.category,
        });
      }
    }
  }

  const grouped = new Map<IngredientCategory, ShoppingCategory>();

  for (const item of bucket.values()) {
    const category = grouped.get(item.category) ?? {
      key: item.category,
      label: categoryLabels[item.category],
      items: [],
    };

    category.items.push({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      checked: item.checked,
      sourceRecipeIds: item.sourceRecipeIds,
      sourceMealSlotIds: item.sourceMealSlotIds,
    });
    grouped.set(item.category, category);
  }

  return {
    planId: plan.id,
    categories: Array.from(grouped.values())
      .map((category) => ({
        ...category,
        items: category.items.sort((left, right) => left.name.localeCompare(right.name)),
      }))
      .sort(
        (left, right) =>
          getCategoryOrderIndex(left.key as IngredientCategory) -
          getCategoryOrderIndex(right.key as IngredientCategory),
      ),
  };
}

function getCategoryOrderIndex(key: IngredientCategory) {
  const index = categoryOrder.indexOf(key);
  return index === -1 ? categoryOrder.length : index;
}
