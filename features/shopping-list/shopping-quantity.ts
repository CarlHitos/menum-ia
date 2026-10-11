import { calculatePurchaseAmount, normalizeUnit } from "@/lib/domain/ingredient-identity";
import { formatIngredientAmount, formatQuantity } from "@/lib/domain/portioning";
import type { ShoppingItem } from "@/lib/domain/types";

type ShoppingAmount = Pick<ShoppingItem, "quantity" | "purchaseAmount" | "unit" | "amountType">;

// This is a shopping presentation estimate, never an input to aggregation,
// pantry calculations or saved shopping checks.
export function formatShoppingAmount(item: ShoppingAmount) {
  if (item.amountType === "to_taste" || item.amountType === "as_needed") {
    return formatIngredientAmount(null, item.unit, item.amountType);
  }

  const { unit, factor } = normalizeUnit(item.unit);
  const amount = (item.purchaseAmount ?? item.quantity) * factor;
  const countUnits: Record<string, [string, string]> = {
    ud: ["unidad", "unidades"],
    diente: ["diente", "dientes"],
    hoja: ["hoja", "hojas"],
    rebanada: ["rebanada", "rebanadas"],
  };

  if (countUnits[unit]) {
    const purchase = calculatePurchaseAmount(amount, unit);
    return `${formatQuantity(purchase)} ${countUnits[unit][purchase === 1 ? 0 : 1]}`;
  }

  if (unit !== "g" && unit !== "ml") {
    return formatIngredientAmount(amount, unit, item.amountType);
  }

  // Small ingredients retain useful precision. Larger purchases use easy
  // increments, always upward so the displayed suggestion covers the need.
  const increment = amount >= 500 ? 50 : amount >= 100 ? 10 : amount >= 1 ? 1 : 0.1;
  const steps = amount / increment;
  const tolerance = Number.EPSILON * Math.max(1, steps) * 16;
  const rounded = Math.ceil(steps - tolerance) * increment;
  const approximate = rounded - amount > Number.EPSILON * Math.max(1, amount) * 16;
  const displayAmount = rounded >= 1000 ? rounded / 1000 : rounded;
  const displayUnit = rounded >= 1000 ? (unit === "g" ? "kg" : "l") : unit;
  return `${approximate ? "≈ " : ""}${formatQuantity(displayAmount)} ${displayUnit}`;
}
