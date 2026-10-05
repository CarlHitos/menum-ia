import { scaleRecipeIngredients } from "@/lib/domain/portioning";
import { calculatePurchaseAmount, ingredientKey, normalizeUnit } from "@/lib/domain/ingredient-identity";
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
        throw new Error(`Missing recipe in weekly plan: ${slot.recipeId}`);
      }

      for (const ingredient of scaleRecipeIngredients(recipe, slot.servings)) {
        const { unit, factor } = normalizeUnit(ingredient.unit);
        const quantity = (ingredient.recipeAmount ?? 0) * factor;
        const key = ingredientKey(ingredient.name, unit, ingredient.productId);
        const legacyKey = `${ingredient.category}:${ingredient.name}:${ingredient.unit}`;
        const existing = bucket.get(key);

        if (existing) {
          existing.totalNeeded = (existing.totalNeeded ?? 0) + quantity;
          existing.hasUnquantifiedAmount ||= ingredient.recipeAmount === null;
          if (ingredient.amountType === "exact") existing.amountType = "exact";
          existing.sourceRecipeIds = [...new Set([...existing.sourceRecipeIds, recipe.id])];
          existing.sourceMealSlotIds = [...new Set([...existing.sourceMealSlotIds, slot.id])];
          existing.legacyKeys = [...new Set([...(existing.legacyKeys ?? []), legacyKey])];
          continue;
        }

        bucket.set(key, {
          id: key,
          name: ingredient.name,
          quantity: 0,
          totalNeeded: quantity,
          amountType: ingredient.amountType,
          hasUnquantifiedAmount: ingredient.recipeAmount === null,
          unit,
          checked: false,
          sourceRecipeIds: [recipe.id],
          sourceMealSlotIds: [slot.id],
          legacyKeys: [legacyKey],
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

    const purchaseAmount = calculatePurchaseAmount(item.totalNeeded ?? 0, item.unit);
    category.items.push({
      ...item,
      quantity: purchaseAmount,
      purchaseAmount,
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
