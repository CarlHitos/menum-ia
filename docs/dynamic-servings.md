# Cantidades dinámicas y compra — fase 1

Fecha: 2026-10-05. Rama: `feat/dynamic-servings-shopping-list`.

## Alcance

Las 33 recetas actuales comparten el cálculo de ingredientes entre receta,
modo cocinar y compra. La ampliación del catálogo se realiza en otra fase.

Flujo:

`baseServings → MealSlot.servings → recipeAmount → totalNeeded → purchaseAmount`

`baseServings` expresa para cuántas raciones se escribieron las cantidades base.
Las recetas originales conservan su base de 3 para no alterar los gramajes ni
introducir redondeos en una conversión innecesaria. El cálculo acepta cualquier
base positiva entera y no contiene divisiones fijas por 3.

## Comensales y menú

- Los bloques usan por defecto el número actual de miembros del hogar.
- `servingsOverride: true` conserva un número elegido para una comida concreta,
  aunque después cambie el tamaño del hogar. El editor permite volver al valor
  del hogar. Cambiar comensales devuelve la semana al estado borrador.
- Los planes antiguos no tienen este campo: usan el tamaño actual del hogar,
  porque la interfaz anterior no permitía personalizar comensales por bloque.
- Se mantienen los bloques no seleccionados en el plan persistido. Una proyección
  compartida filtra las comidas del hogar para compra y contexto de receta;
  el menú usa las mismas preferencias. Así no se compran comidas ocultas y
  pueden volver a mostrarse si se cambian las preferencias.
- Los enlaces de receta y cocina conservan `planId` y `slotId`. El servidor
  comprueba que el plan pertenece al hogar y que el bloque contiene esa receta.
  Sin contexto de menú se usa el número de miembros del hogar.
- El dashboard ordena los guardados y espera su finalización antes de navegar
  desde los botones de receta o compra. Los errores ofrecen reintento.
- Los identificadores nuevos de semana incluyen el hogar. Los identificadores
  anteriores siguen siendo válidos y el upsert no puede reasignar otro hogar.

## Ingredientes y compra

- `exact`: `recipeAmount = quantity * requestedServings / baseServings`.
- `to_taste` y `as_needed`: se muestran «Al gusto» y «Según necesidad».
  No se inventa una cantidad multiplicando por los comensales.
- `amountType` prevalece sobre el antiguo `scalable`. Se han revisado las
  excepciones del catálogo: caldo, cacao, soja y miel medidos sí escalan;
  canela y aceite de cocción tienen tratamiento cualitativo.
- La identidad de compra usa `productId` cuando existe, o un nombre normalizado
  con alias explícitos. No se mezclan productos secos y cocidos ni cortes de
  carne distintos. «Pollo» requiere revisión antes de asumir «pechuga».
- kg se convierte a g y l a ml antes de sumar. No se convierte peso a unidades
  ni volumen a peso sin una equivalencia específica.
- No se redondean las cantidades de cada receta. `totalNeeded` conserva la suma;
  `purchaseAmount` redondea hacia arriba productos por unidades, dientes,
  hojas o rebanadas una vez agregado el total semanal.
- `quantity` de `ShoppingItem` conserva compatibilidad con la UI/estado anterior
  y equivale a `purchaseAmount`. Son campos derivados, no nuevas columnas.
- Las cantidades cualitativas tienen total numérico 0 y un `amountType` que
  evita mostrarlo como una necesidad de 0 unidades. Cuando hay uso exacto y
  cualitativo se conserva el total medido y la indicación adicional.
- `calculatePurchaseAmount` admite descontar una cantidad de despensa en la
  misma unidad antes de redondear. La app aún no tiene inventario de despensa.
- Los checks existentes se reconcilian por identidad y unidades. Se conservan
  cuando las entradas equivalentes estaban marcadas y la compra no aumenta.
  Si aumenta, el producto vuelve a pendiente. No se trasladan entre planes.

## Compatibilidad y datos

### Presentación de compra (2026-10-11)

La interfaz de compra muestra cantidades orientativas prácticas. Para peso y
volumen, redondea hacia arriba a incrementos de 50 g/ml desde 500, de 10 g/ml
desde 100 y de 1 g/ml para cantidades menores; por debajo de 1 mantiene décimas.
Indica `≈` cuando hay aproximación y usa kg/l desde 1000 g/ml.

Por ejemplo: 633,33 g se muestra como «≈ 650 g», 966,67 g como «≈ 1 kg» y
166,67 g como «≈ 170 g». Los huevos se muestran como «19 unidades» sin el
desglose «Necesario: 18,67».

Esta presentación no cambia `totalNeeded`, `purchaseAmount`, las cantidades de
receta ni el estado persistido. Tampoco supone un tamaño de envase comercial.
Los productos marcados aparecen tachados al final de su propia categoría y
pueden desmarcarse allí. Se elimina el bloque global duplicado de completados;
las categorías conservan su orden y su estado abierto al completar productos.

No hace falta migración SQL. Los campos adicionales viven en estructuras JSON
ya existentes y las cantidades de compra se calculan en memoria.

El catálogo inicial elimina ajustes de personas del ejemplo y textos como
«en tres bols». `normalizeRecipeForServings` aplica las mismas correcciones al
leer recetas ya persistidas, sin sobrescribirlas en BD. La forma antigua de
`PortionAdjustment` permanece por compatibilidad, pero el cálculo compartido no
aplica ajustes globales del catálogo. Para reintroducir ajustes por persona se
necesitan participantes y decisiones explícitas del hogar.

## Archivos principales

- `lib/domain/portioning.ts`: escala y formatea ingredientes.
- `lib/domain/ingredient-identity.ts`: alias, unidades y regla de compra.
- `lib/domain/shopping-list.ts`, `shopping-list-state.ts`: agregación y checks.
- `lib/domain/plan-servings.ts`, `weekly-plan-preview.ts`: comensales y contexto.
- `lib/domain/recipe-compatibility.ts`, `lib/dal/recipes.ts`,
  `lib/data/recipe-catalog.ts`: recetas actuales y compatibilidad.
- `lib/server/recipe-serving-context.ts`, páginas de receta, cocina, dashboard
  y compra: resolución del contexto autenticado.
- `features/dashboard`, `features/week-menu`, `features/recipes`,
  `features/cooking`, `features/shopping-list`: presentación y edición.
- `app/api/weekly-plan/route.ts`, `lib/dal/plans.ts`,
  `lib/domain/weekly-plan-runtime.ts`: validación y guardado.
- `tests/servings-shopping.test.ts`, `package.json`: pruebas reproducibles.

## Validación

Ejecutar `npm test`, `npm run lint` y comprobación TypeScript.
Las pruebas cubren los ejemplos 0,4 + 0,6 cebollas, 540 + 450 g de pollo,
2,6 aguacates, terceras partes, unidades compatibles, ingredientes cualitativos,
las 33 recetas con 1/2/4/5 comensales, preferencias, contexto de enlaces,
compatibilidad de registros antiguos y checks. También renderizan receta y
cocina para comprobar sus cantidades visibles.

El build puede verificarse en una copia temporal sin `.env*`, con variables
ficticias y `next build --webpack`; compilar no valida OAuth ni operaciones de
BD reales. La descarga de fuentes requiere red.

Comprobación manual en un entorno configurado:

1. Elegir solo comida y cena para un hogar de dos personas.
2. Abrir un bloque, cambiar a cuatro comensales y esperar a que termine de guardar.
3. Abrir receta y modo cocinar: ambos deben indicar cuatro y las mismas cantidades.
4. Abrir la compra: sumar las comidas seleccionadas, sin desayunos ni snacks.
5. Marcar un producto, aumentar la cantidad necesaria y volver: debe quedar pendiente.
6. Repetir una receta en dos bloques con diferentes comensales; cada enlace debe
   conservar su bloque y la compra debe sumar ambos.
7. Recargar, verificar el guardado y volver a usar el tamaño del hogar.

## Límites de esta fase

- No descuenta sobras ni expande componentes preparados a ingredientes crudos;
  las preparaciones existentes siguen figurando como tales en la compra.
- No añade recetas nuevas, planificación nutricional, formatos comerciales ni
  ajustes automáticos por objetivo personal.
- Los cambios no se publican ni se aplican a una BD remota desde esta fase.
