// Explicit aliases only: preparations, cuts and dry/cooked products remain distinct.
const aliases: Record<string, string> = {
  cebollas: "cebolla",
  aguacates: "aguacate",
  huevo: "huevos",
  patatas: "patata",
  tomates: "tomate",
  platanos: "platano",
  limones: "limon",
  zanahorias: "zanahoria",
  "pechugas de pollo": "pechuga de pollo",
  feta: "queso feta",
  "aceite de oliva virgen extra": "aceite de oliva",
  aove: "aceite de oliva",
};

export function normalizeIngredientName(name: string) {
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim().toLowerCase().replace(/\s+/g, " ");
  return aliases[normalized] ?? normalized;
}

export function normalizeUnit(unit: string): { unit: string; factor: number } {
  const value = unit.trim().toLowerCase();
  const units: Record<string, { unit: string; factor: number }> = {
    kg: { unit: "g", factor: 1000 },
    l: { unit: "ml", factor: 1000 },
    ud: { unit: "ud", factor: 1 },
    uds: { unit: "ud", factor: 1 },
    unit: { unit: "ud", factor: 1 },
    unidad: { unit: "ud", factor: 1 },
    unidades: { unit: "ud", factor: 1 },
    dientes: { unit: "diente", factor: 1 },
    hojas: { unit: "hoja", factor: 1 },
    rebanadas: { unit: "rebanada", factor: 1 },
  };
  return units[value] ?? { unit: value, factor: 1 };
}

export function ingredientKey(name: string, unit: string, productId?: string) {
  return `${productId ?? normalizeIngredientName(name)}:${normalizeUnit(unit).unit}`;
}

export function calculatePurchaseAmount(totalNeeded: number, unit: string, pantryAmount = 0) {
  if (!Number.isFinite(totalNeeded) || totalNeeded < 0 || !Number.isFinite(pantryAmount) || pantryAmount < 0) {
    throw new Error("Invalid purchase quantities");
  }
  const amountToBuy = Math.max(0, totalNeeded - pantryAmount);
  // Ignore floating point noise, not fractions of a product. Count units are
  // rounded only after aggregation (and, later, subtraction of pantry stock).
  const nearest = Math.round(amountToBuy);
  const stableAmount = Math.abs(amountToBuy - nearest) <= Number.EPSILON * Math.max(1, amountToBuy) * 16
    ? nearest : amountToBuy;
  return ["ud", "diente", "hoja", "rebanada"].includes(normalizeUnit(unit).unit)
    ? Math.ceil(stableAmount) : stableAmount;
}
