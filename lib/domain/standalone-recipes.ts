import type { Recipe, RecipeStep } from "./types";

// Curated V1 corrections also apply to existing DB rows. Reuse metadata stays dormant.
const descriptions: Record<string, string> = {
  "avena-yogur-fruta": "Avena con yogur y fruta para un desayuno sencillo y rápido.",
  "arroz-pollo-verduras": "Arroz con pollo salteado y verduras, preparado para esta comida.",
  "wraps-pollo": "Wraps de pollo a la sartén con lechuga, tomate y salsa de yogur.",
  "pasta-carne-tomate": "Pasta integral con salsa de carne picada y tomate preparada al momento.",
  "salteado-arroz-pavo": "Arroz recién cocido con pavo y verduras salteadas.",
  "pizza-casera-rapida": "Pizza sobre tortilla integral con carne, tomate y mozzarella.",
  "pollo-boniato-ensalada": "Pollo al horno con boniato y ensalada fresca para acompañar.",
};
const steps: Record<string, Record<string, Partial<RecipeStep>>> = {
  "arroz-pollo-verduras": {
    "cook-rice": { detail: "Cuece todo el arroz indicado en los ingredientes siguiendo el tiempo del envase y escúrrelo.", checklist: ["Lava el arroz si lo indica el envase", "Comprueba que quede tierno"] },
    "cook-chicken": { detail: "Dora el pollo y saltea las verduras hasta que el pollo esté cocinado y las verduras tiernas.", checklist: ["Cocina todo el pollo indicado", "Ajusta el fuego para que las verduras no se quemen"] },
    "combine-main": { detail: "Mezcla el arroz con todo el pollo y las verduras. Reparte la preparación entre los comensales y sirve.", checklist: ["Mezcla bien los ingredientes", "Sirve las raciones de esta comida"] },
  },
  "wraps-pollo": {
    "heat-filling": { title: "Cocina el pollo", detail: "Corta el pollo en tiras y cocínalo en la sartén hasta que esté hecho. Añade las especias que prefieras.", timerSeconds: 600, checklist: ["Corta tiras de tamaño parecido", "Comprueba que el pollo esté cocinado antes de montar los wraps"] },
  },
  "pasta-carne-tomate": {
    "cook-sauce": { detail: "Dora la carne picada, añade el tomate y cocina a fuego medio hasta que la carne esté hecha y la salsa reduzca.", checklist: ["Desmenuza la carne mientras se cocina", "Usa toda la salsa para esta pasta"] },
  },
  "salteado-arroz-pavo": {
    "prep-stir-fry": { title: "Prepara pavo y verduras", detail: "Lava y corta las verduras y el pavo en trozos de tamaño parecido mientras se cuece el arroz." },
    "cook-turkey-stir": { detail: "Dora el pavo en el wok hasta que esté cocinado. Trabaja por tandas si no cabe bien.", timerSeconds: 360 },
    "toast-rice": { detail: "Añade las verduras al pavo y saltéalas hasta que estén tiernas. Incorpora el arroz que has cocido para esta receta y termina con la salsa de soja." },
  },
  "pizza-casera-rapida": {
    "prep-pizza-base": { detail: "Precalienta el horno a 220 °C y prepara una sartén para cocinar la carne y el tomate." },
    "assemble-pizza": { detail: "Extiende la salsa de carne y tomate que acabas de preparar sobre las tortillas. Añade el tomate cortado y la mozzarella.", checklist: ["Reparte toda la salsa entre las bases", "Distribuye el queso sin cargar demasiado el centro"] },
  },
  "pollo-boniato-ensalada": {
    "roast-tray": { detail: "Hornea todo el pollo y el boniato hasta que el pollo esté cocinado y el boniato tierno." },
    "rest-roast": { title: "Reposa y sirve", detail: "Deja reposar el pollo unos minutos y reparte todo el pollo y el boniato con la ensalada entre los comensales.", checklist: ["Comprueba el punto del boniato", "Sirve con la ensalada recién aliñada"] },
  },
};

export function normalizeStandaloneRecipe(recipe: Recipe): Recipe {
  const overrides = steps[recipe.id];
  let ingredients = recipe.ingredients;
  let recipeSteps = recipe.steps.map((step) => ({ ...step, ...overrides?.[step.id] }));
  let durationMinutes = recipe.durationMinutes;
  let utensils = recipe.utensils;
  if (recipe.id === "wraps-pollo") {
    durationMinutes = Math.max(durationMinutes, 20);
    utensils = [...new Set([...utensils, "Tabla y cuchillo", "Bol"])];
  }
  if (recipe.id === "salteado-arroz-pavo") {
    durationMinutes = Math.max(durationMinutes, 35);
    utensils = [...new Set([...utensils, "Cazo"])];
    if (!recipeSteps.some((step) => step.id === "cook-rice-stir")) {
      recipeSteps = [{ id: "cook-rice-stir", title: "Cuece el arroz", detail: "Cuece el arroz indicado en los ingredientes siguiendo las instrucciones del envase. Escúrrelo antes de incorporarlo al wok.", timerSeconds: 900 }, ...recipeSteps];
    }
  }
  if (recipe.id === "pizza-casera-rapida") {
    // Reviewed breakdown per amount of sauce: 250 g -> 150 g raw meat + 200 g tomato.
    ingredients = ingredients.flatMap((ingredient) => ingredient.id === "meat-sauce-pizza" ? [
      { ...ingredient, id: "pizza-beef", name: "Carne picada", quantity: ingredient.quantity * 0.6, category: "protein" as const, scalable: true, amountType: "exact" as const },
      { ...ingredient, id: "pizza-tomato-sauce", name: "Tomate triturado", quantity: ingredient.quantity * 0.8, category: "vegetables" as const, scalable: true, amountType: "exact" as const },
    ] : [ingredient]);
    durationMinutes = Math.max(durationMinutes, 30);
    utensils = [...new Set([...utensils, "Sartén"])];
    if (!recipeSteps.some((step) => step.id === "cook-pizza-sauce")) {
      recipeSteps.splice(1, 0, { id: "cook-pizza-sauce", title: "Cocina carne y tomate", detail: "Dora la carne picada en la sartén. Añade el tomate triturado y deja reducir hasta que la carne esté cocinada y la salsa no quede acuosa.", timerSeconds: 720 });
    }
  }
  return { ...recipe, description: descriptions[recipe.id] ?? recipe.description, ingredients, steps: recipeSteps, durationMinutes, utensils };
}
