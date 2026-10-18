import { normalizeUnit } from "@/lib/domain/ingredient-identity";
import { formatIngredientAmount, formatQuantity } from "@/lib/domain/portioning";
import type { RecipeIngredient } from "@/lib/domain/types";

// Presentation only: never use these rounded values for scaling or shopping.
export function formatRecipeAmount(
  quantity: number | null,
  unit: string,
  amountType: RecipeIngredient["amountType"],
) {
  if (quantity === null || amountType === "to_taste" || amountType === "as_needed") {
    return formatIngredientAmount(quantity, unit, amountType);
  }
  const normalized = normalizeUnit(unit);
  const amount = quantity * normalized.factor;
  if (normalized.unit === "g" || normalized.unit === "ml") {
    const increment = amount >= 100 ? 10 : amount >= 5 ? 5 : 0.1;
    const rounded = Number.isInteger(amount)
      ? amount
      : Math.max(increment, Math.round(amount / increment) * increment);
    // Retain very small amounts rather than rounding them up severalfold.
    if (amount > 0 && amount < 0.1) return `< 0,1 ${normalized.unit}`;
    const approximate = Math.abs(rounded - amount) > 0.000001;
    return `${approximate ? "≈ " : ""}${formatQuantity(rounded)} ${normalized.unit}`;
  }
  const countUnits = ["ud", "diente", "hoja", "rebanada", "cucharada", "cucharadita"];
  if (countUnits.includes(normalized.unit)) {
    const fractions: [number, string][] = [
      [0, ""], [1 / 8, "1/8"], [1 / 4, "1/4"], [1 / 3, "1/3"],
      [1 / 2, "1/2"], [2 / 3, "2/3"], [3 / 4, "3/4"], [1, ""],
    ];
    const whole = Math.floor(amount);
    const remainder = amount - whole;
    const nearest = fractions.reduce((best, item) =>
      Math.abs(item[0] - remainder) < Math.abs(best[0] - remainder) ? item : best,
    );
    if (Math.abs(nearest[0] - remainder) <= 0.035 && (whole > 0 || nearest[0] > 0 || amount === 0)) {
      const integer = whole + (nearest[0] === 1 ? 1 : 0);
      const value = [integer || !nearest[1] ? String(integer) : "", nearest[1]].filter(Boolean).join(" ");
      return `${value} ${normalized.unit}`;
    }
  }
  return formatIngredientAmount(quantity, unit, amountType);
}
