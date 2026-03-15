# MenumIA — Data Model

## 1. Propósito

Este documento define el modelo de datos del MVP de MenumIA desde dos perspectivas:

- modelo conceptual objetivo del producto
- estado actual implementado en el código

Su función es servir como referencia para:

- alinear dominio, UI y futura persistencia remota
- distinguir entidades núcleo de datos derivados
- evitar que la app derive hacia una simple colección de recetas
- preparar una evolución ordenada hacia auth y almacenamiento persistente

Este documento complementa a `PRD.md`, `AGENTS.md` y `docs/meal-planning-foundation.md`.

## 2. Principios de modelado

El modelo del MVP debe respetar estas reglas:

- una sola base de comidas para todo el hogar
- ajustes por persona mediante raciones o pequeñas variaciones, no menús separados por defecto
- semana base repetible y editable
- batch cooking como parte explícita del dominio
- sobras reutilizables como relación explícita entre comidas
- lista de compra agregada derivada del plan semanal
- separación clara entre datos persistibles, datos derivados y estado local de UI

## 3. Capas del modelo

### 3.1 Entidades núcleo del dominio

Son las estructuras que representan la lógica principal del producto y que, en una fase posterior, deberían poder persistirse remotamente.

Incluyen:

- `Household`
- `HouseholdMember`
- `WeekTemplate`
- `WeeklyPlan`
- `PlannedDay`
- `MealSlot`
- `Recipe`
- `RecipeIngredient`
- `RecipeStep`
- `PortionAdjustment`
- `BatchCookingBlock`
- `LeftoverFlow`

### 3.2 Objetos embebidos o subestructuras

No necesariamente requieren colección o tabla propia en una primera versión persistente.

Incluyen:

- `planningPreferences` dentro de `Household`
- `ProducedComponent` dentro de `Recipe.baseYield` y `BatchCookingBlock.produces`

### 3.3 Datos derivados

Se calculan a partir de entidades núcleo y no tienen por qué persistirse como fuente canónica.

Incluyen:

- `ShoppingList`
- `ShoppingCategory`
- `ShoppingItem`
- `weeklyPlanPreview`
- `householdSnapshot`
- contexto derivado del dashboard

### 3.4 Estado local de UI

Es temporal, orientado a interacción, y no debe confundirse con el modelo canónico.

Incluye:

- `OnboardingDraft`
- estado de pasos del onboarding
- estado de checkboxes de la shopping list
- progreso local del modo cocinar

## 4. Modelo conceptual objetivo del MVP

### 4.1 Household

Representa el hogar que planifica y cocina en conjunto.

Campos clave:

- `id`
- `name`
- `planningPreferences`
- `members[]`

Responsabilidad:

- agrupar a los miembros del hogar
- almacenar reglas globales de planificación
- actuar como raíz funcional del contexto del producto

### 4.2 HouseholdMember

Representa a cada persona del hogar.

Campos clave:

- `id`
- `name`
- `age?`
- `goal`
- `restrictions[]`
- `allergies[]`
- `dislikes[]`
- `portionProfile`
- `snackProfile?`

Responsabilidad:

- capturar objetivos y restricciones personales
- permitir ajustes por persona sobre una base de receta común

### 4.3 WeekTemplate

Representa una semana base reutilizable.

Campos clave:

- `id`
- `householdId`
- `name`
- `repeatable`
- `days[]`
- `batchBlocks[]`

Responsabilidad:

- servir como semana base repetible
- modelar la estructura que puede clonarse o adaptarse semana a semana

### 4.4 WeeklyPlan

Representa una instancia concreta de planificación semanal.

Campos clave:

- `id`
- `householdId`
- `templateId?`
- `weekStart`
- `days[]`
- `batchBlocks[]`
- `leftoverFlows[]`

Responsabilidad:

- representar la semana activa
- enlazar planificación, batch cooking y reutilización de sobras

### 4.5 PlannedDay

Agrupa los bloques de un día concreto.

Campos clave:

- `dayKey`
- `label`
- `slots[]`

Responsabilidad:

- organizar los `MealSlot` de cada día

### 4.6 MealSlot

Representa un bloque de comida dentro de un día.

Campos clave:

- `id`
- `mealType`
- `recipeId`
- `dayKey`
- `servings`
- `tags[]`
- `notes?`

Responsabilidad:

- enlazar una receta concreta a una comida de una semana
- marcar si el slot genera sobras, las usa o es una cena rápida

### 4.7 Recipe

Representa la base culinaria común del hogar.

Campos clave:

- `id`
- `title`
- `description`
- `category`
- `durationMinutes`
- `difficulty`
- `baseServings`
- `utensils[]`
- `ingredients[]`
- `steps[]`
- `substitutions[]`
- `portionAdjustments[]`
- `batchCookingNotes?`
- `leftoverNotes?`
- `quickDinner?`
- `baseYield?`

Responsabilidad:

- definir la base común de preparación
- permitir escalado y adaptación por persona
- aportar metadatos de batch cooking, sobras y cenas anti-delivery

### 4.8 RecipeIngredient

Representa un ingrediente base de una receta.

Campos clave:

- `id`
- `name`
- `quantity`
- `unit`
- `category`
- `scalable`
- `componentRef?`

Responsabilidad:

- describir qué se necesita para cocinar
- servir como base para el cálculo de lista de compra
- enlazar, cuando aplica, con componentes reutilizables del batch

### 4.9 RecipeStep

Representa cada paso del modo cocinar.

Campos clave:

- `id`
- `title`
- `detail`
- `timerSeconds?`
- `checklist?`

Responsabilidad:

- soportar vista de receta y modo cocinar paso a paso

### 4.10 PortionAdjustment

Representa ajustes por persona sobre una misma receta base.

Campos clave:

- `id`
- `memberId`
- `ingredientId`
- `deltaQuantity`
- `unit`
- `note?`

Responsabilidad:

- aplicar cambios de ración sin crear recetas distintas por defecto

### 4.11 ProducedComponent

Representa una preparación intermedia o resultado reutilizable.

Campos clave:

- `id`
- `name`
- `quantity`
- `unit`
- `expiresInDays?`

Responsabilidad:

- modelar arroz cocido, pollo cocinado, salsa de carne u otros outputs reutilizables

### 4.12 BatchCookingBlock

Representa un bloque de preparación fuerte.

Campos clave:

- `id`
- `label`
- `plannedDay`
- `produces[]`
- `feedsMealSlotIds[]`

Responsabilidad:

- hacer explícita la cocina por lotes
- vincular una preparación fuerte con varios slots de la semana

### 4.13 LeftoverFlow

Representa la relación entre una comida que genera componentes y otra que los reutiliza.

Campos clave:

- `sourceMealSlotId`
- `producedComponentId`
- `targetMealSlotId`
- `note?`

Responsabilidad:

- modelar explícitamente el aprovechamiento de sobras

### 4.14 ShoppingList

Representa la vista agregada de compra semanal.

Campos clave:

- `planId`
- `categories[]`

Responsabilidad:

- proyectar en formato de compra la suma de recetas e ingredientes del plan semanal

Nota:

En el modelo conceptual del MVP se considera un dato derivado. En una fase futura podría persistirse parcialmente si se quiere guardar estado de check, edición manual o histórico.

## 5. Relaciones entre entidades

Relaciones principales:

- `Household` 1:N `HouseholdMember`
- `Household` 1:N `WeekTemplate`
- `Household` 1:N `WeeklyPlan`
- `WeekTemplate` 1:N `PlannedDay`
- `WeeklyPlan` 1:N `PlannedDay`
- `PlannedDay` 1:N `MealSlot`
- `MealSlot` N:1 `Recipe`
- `Recipe` 1:N `RecipeIngredient`
- `Recipe` 1:N `RecipeStep`
- `Recipe` 1:N `PortionAdjustment`
- `WeeklyPlan` 1:N `BatchCookingBlock`
- `WeeklyPlan` 1:N `LeftoverFlow`
- `BatchCookingBlock` 1:N `ProducedComponent`
- `LeftoverFlow` enlaza `MealSlot` origen + `ProducedComponent` + `MealSlot` destino
- `ShoppingList` se deriva de `WeeklyPlan + Recipe + RecipeIngredient + PortionAdjustment`

## 6. Datos que vienen del onboarding

El onboarding debería ser la fuente de entrada inicial para construir o editar el contexto del hogar.

Datos esperados desde onboarding:

- nombre del hogar
- número de personas
- nombre de cada persona
- objetivo de cada persona
- alergias
- restricciones
- alimentos que no gustan
- presupuesto semanal aproximado
- tiempo disponible para cocinar
- supermercado habitual
- preferencia por repetir semana o variar

Mapeo esperado al dominio:

- `Household.name`
- `Household.members[]`
- `HouseholdMember.name`
- `HouseholdMember.goal`
- `HouseholdMember.restrictions[]`
- `HouseholdMember.allergies[]`
- `HouseholdMember.dislikes[]`
- `Household.planningPreferences.weeklyBudget`
- `Household.planningPreferences.cookingLoad`
- `Household.planningPreferences.preferredStores`
- `Household.planningPreferences.repeatMode`

## 7. Datos derivados y no necesariamente persistentes

### 7.1 Shopping list agregada

Se deriva hoy desde:

- `WeeklyPlan`
- `Recipe`
- `RecipeIngredient`
- `PortionAdjustment`

No debe considerarse la fuente canónica del dominio.

### 7.2 Proyecciones de UI

Incluyen:

- resumen del hogar
- preview del menú semanal
- copy contextual del dashboard

Estas estructuras son útiles para presentación, no para persistencia canónica.

### 7.3 Estado local del onboarding

`OnboardingDraft` es un estado de interacción cliente.

Actualmente:

- sirve como entrada editable del flujo multi-step
- se guarda en `localStorage`
- personaliza el dashboard

No debe confundirse con una entidad remota final.

## 8. Estado actual implementado

### 8.1 Tipos de dominio actuales

El estado actual del código ya contiene una base de dominio consistente en [lib/domain/types.ts](/home/carl_hitos/code/menumia/lib/domain/types.ts).

Están implementados:

- `Household`
- `HouseholdMember`
- `Recipe`
- `RecipeIngredient`
- `RecipeStep`
- `PortionAdjustment`
- `ProducedComponent`
- `MealSlot`
- `PlannedDay`
- `BatchCookingBlock`
- `LeftoverFlow`
- `WeekTemplate`
- `WeeklyPlan`
- `ShoppingList`
- `ShoppingCategory`
- `ShoppingItem`

### 8.2 Selectores y derivados actuales

El proyecto ya usa lógica derivada para:

- construir shopping list agregada
- generar preview semanal
- proyectar contexto del dashboard
- mapear onboarding local a contexto de UI

### 8.3 Simplificaciones actuales del MVP

Aunque el modelo conceptual objetivo es más amplio, el estado implementado aún simplifica varios puntos:

- el onboarding local usa `OnboardingDraft`, no construye todavía una entidad `Household` persistente real
- la vista semanal se centra en comida y cena, no en desayuno y snack dentro de la UI principal
- la shopping list todavía es una derivación local y no guarda edición manual persistente
- el progreso del modo cocinar es solo local de sesión

## 9. Partes preparadas para futura persistencia remota

Estas partes ya tienen forma razonable para evolucionar a persistencia remota:

- `Household`
- `HouseholdMember`
- `WeekTemplate`
- `WeeklyPlan`
- `PlannedDay`
- `MealSlot`
- `Recipe`
- `RecipeIngredient`
- `RecipeStep`
- `PortionAdjustment`
- `BatchCookingBlock`
- `LeftoverFlow`

Razones:

- usan `id` y referencias estables
- separan bien dominio y proyecciones
- permiten mapear a documento o esquema relacional sin rediseño total

Estas partes son mejores candidatas a seguir como derivadas:

- `ShoppingList`
- snapshots para dashboard
- previews de UI

## 10. Modelo conceptual objetivo vs estado actual implementado

### 10.1 Lo que ya está alineado

- base común de comidas para todo el hogar
- ajustes por persona mediante `PortionAdjustment`
- semana base repetible con `WeekTemplate`
- semana activa con `WeeklyPlan`
- batch cooking explícito con `BatchCookingBlock`
- sobras explícitas con `LeftoverFlow`
- lista de compra agregada derivada del plan semanal

### 10.2 Lo que todavía está simplificado

- onboarding no separa todavía alergias y restricciones en campos distintos del flujo UI
- el onboarding guarda strings simples, no arrays normalizados ni entidad `Household` persistente
- desayuno y snack están presentes en el modelo conceptual, pero no forman parte de la vista principal del menú actual
- shopping list no soporta todavía edición manual persistente ni merge con items añadidos por usuario
- no existe aún historial real de semanas ni favoritos persistidos

## 11. Inconsistencias y puntos a vigilar

### 11.1 Onboarding vs dominio de miembros

El dominio actual soporta:

- `restrictions[]`
- `allergies[]`
- `dislikes[]`

Pero el onboarding implementado captura solo:

- `restrictions` como string
- `dislikes` como string

No captura todavía `allergies` por separado.

Esta es la inconsistencia principal entre modelo ideal y estado actual.

### 11.2 Shopping list como entidad

El tipo `ShoppingList` existe en código, pero conceptualmente se usa como dato derivado.

Eso es correcto para el MVP, pero debe mantenerse explícito para no convertirla en una entidad canónica sin una decisión de producto clara.

### 11.3 OnboardingDraft como cache local

Hoy `OnboardingDraft` se usa para persistencia local de cliente.

Debe seguir tratándose como:

- cache editable local
- entrada del flujo de onboarding
- fuente temporal para personalización de UI

No como sustituto de `Household` persistido remotamente.

## 12. Recomendación para la siguiente fase

Antes de introducir backend o auth, conviene mantener esta separación:

- dominio persistible en `lib/domain`
- mocks y fixtures en `lib/mocks`
- proyecciones y mapeos en selectores y mappers
- estado local de cliente fuera del modelo canónico

Cuando llegue persistencia remota, la transición más limpia será:

1. mapear `OnboardingDraft` a `Household`
2. persistir `Household`, `WeekTemplate` y `WeeklyPlan`
3. seguir derivando `ShoppingList` y proyecciones de UI a partir del dominio persistido
