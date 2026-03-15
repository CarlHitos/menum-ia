# Meal Planning Foundation

## Propósito de este documento

Este documento resume la lógica funcional base sobre la que debe construirse MenumIA.

No es solo una colección de recetas. Es una base de producto para una app que ayuda a un hogar a:
- comer mejor
- gastar menos
- planificar la semana
- cocinar con menos fricción
- aprovechar sobras
- reducir pedidos de comida fuera

Este documento debe usarse junto con `PRD.md` y `AGENTS.md` como fuente principal del dominio del MVP.

---

## Contexto del caso real

La lógica base parte de un hogar de 3 personas con objetivos distintos:

- Carlos: ganar masa muscular y subir algo de peso
- Mandy: bajar peso y tonificar
- Sergi: mantenerse y tonificar

La solución correcta no es crear 3 dietas independientes.

La app debe soportar:
- una misma base de comidas para todo el hogar
- ajustes de ración por persona
- un sistema práctico y repetible
- cocina compartida
- ahorro real en compra y comida fuera

---

## Principios funcionales clave

### 1. Una sola base de comida para todos
La app debe trabajar sobre una base común de platos para el hogar.

Cada receta debe poder adaptarse por persona con cambios de ración, no con recetas distintas por defecto.

Ejemplo:
- Carlos: más cantidad de carbohidrato y proteína
- Mandy: menos carbohidrato, misma base
- Sergi: ración intermedia

### 2. Semana repetible
La planificación no necesita ser totalmente distinta cada semana.

La app debe permitir una:
- semana base reusable
- semana editable
- semana repetible con pequeños cambios

### 3. Lista de compra agregada
La lista de compra no es una función secundaria.

La app debe generar una lista total semanal agregada desde:
- recetas
- ingredientes
- número de personas
- ajustes de ración
- necesidades de desayunos, comidas, cenas y snacks

### 4. Aprovechamiento de sobras
El ahorro real depende en gran parte de reutilizar ingredientes y preparaciones.

La app debe soportar:
- recetas que generan sobras
- platos que reutilizan sobras
- relación entre comida origen y comida derivada

### 5. Batch cooking
La app debe permitir cocinar fuerte 1 o 2 veces por semana para simplificar el resto de días.

Esto no debe ser una idea secundaria, sino parte del modelo del producto.

### 6. Cenas anti-pedir comida
Muchas veces el problema no es el menú del mediodía, sino la cena cuando hay cansancio.

La app debe incluir cenas rápidas y fáciles como mecanismo directo para reducir pedidos de comida fuera.

---

## Estructura semanal base

La app debe poder representar una semana de ejemplo como esta.

## Desayunos base

### Opción A
Avena con yogur, plátano y crema de cacahuete

Por persona:
- 60 g avena
- Carlos: 80 g avena
- 250 g yogur natural o skyr
- 1 plátano
- 10–15 g crema de cacahuete

### Opción B
Tostadas con tomate, aguacate y huevos

Por persona:
- 2 tostadas
- Carlos: 3–4 tostadas
- 2 huevos
- tomate triturado
- 1/4 aguacate

### Opción C
Yogur con fruta y frutos secos

Por persona:
- 250 g yogur
- 1 fruta
- 20 g frutos secos
- 30–40 g avena o muesli

### Opción D
Tortilla francesa + fruta + tostada

Por persona:
- 2–3 huevos
- 1 fruta
- 1–2 tostadas

---

## Media mañana / meriendas

La app debe contemplar snacks opcionales y extras por persona.

Opciones base:
- fruta
- yogur natural
- bocadillo pequeño de pavo y queso
- frutos secos
- hummus con zanahoria
- batido de leche o yogur con plátano y avena

Importante:
- Carlos puede necesitar 1 snack extra al día
- Mandy debe mantener proteína alta y controlar picoteo innecesario
- Sergi debe mantener una ración intermedia

---

## Menú semanal base

### Lunes
**Comida**
- Arroz con pollo y verduras

**Cena**
- Tortilla de patata y calabacín + ensalada

### Martes
**Comida**
- Lentejas guisadas con verduras y arroz

**Cena**
- Wraps de pollo, lechuga, tomate y yogur

### Miércoles
**Comida**
- Pasta integral con carne picada y tomate casero

**Cena**
- Crema de verduras + tostadas con atún y queso fresco

### Jueves
**Comida**
- Merluza al horno con patata y brócoli

**Cena**
- Ensalada completa de garbanzos con huevo

### Viernes
**Comida**
- Salteado de arroz con pavo y verduras

**Cena**
- Pizza casera rápida con tortilla, wrap o base simple

### Sábado
**Comida**
- Albóndigas de carne con tomate y puré de patata

**Cena**
- Bocadillos completos + ensalada o verduras al horno

### Domingo
**Comida**
- Pollo al horno con boniato y ensalada

**Cena**
- Cena de aprovechamiento con sobras

---

## Recetas base que el MVP debe poder representar

El MVP no necesita miles de recetas, pero sí debe soportar bien una base de recetas como estas:

- arroz con pollo y verduras
- tortilla de patata y calabacín
- lentejas guisadas con verduras y arroz
- wraps de pollo
- pasta integral con carne picada y tomate
- crema de verduras
- merluza al horno con patata y brócoli
- ensalada de garbanzos con huevo
- salteado de arroz con pavo y verduras
- pizza casera rápida
- albóndigas con tomate y puré
- pollo al horno con boniato

Cada receta debe poder almacenar:
- ingredientes
- cantidades base
- número de raciones base
- pasos
- duración
- dificultad
- categoría
- notas de batch cooking
- notas de sobras
- ajustes por persona

---

## Ajustes por persona

La app debe permitir cambios de ración sobre una misma receta base.

### Carlos
Objetivo:
- ganar masa muscular y subir algo de peso

Lógica:
- añadir 1 snack extra al día
- subir ración de arroz, pasta o patata
- mantener proteína alta en 4 ingestas al día

Extras útiles:
- yogur + avena + plátano
- bocadillo de pavo
- leche o yogur con fruta y avena

### Mandy
Objetivo:
- bajar peso y tonificar

Lógica:
- misma comida base
- menos arroz, pasta o patata
- mucha verdura
- proteína completa en cada comida

### Sergi
Objetivo:
- mantenerse y tonificar

Lógica:
- ración intermedia
- proteína y verdura altas
- carbohidrato moderado

---

## Lógica de batch cooking

La app debe soportar una estructura como esta:

### Domingo
Preparar:
- arroz cocido
- pollo al horno
- verduras asadas
- huevos cocidos

### Miércoles
Preparar:
- crema de verduras
- pasta con salsa de carne
- patata cocida o puré

Objetivo:
- resolver varias comidas rápidas durante la semana
- reducir fricción entre semana
- ahorrar tiempo y dinero

---

## Lógica de reutilización de sobras

La app debe soportar relaciones explícitas entre comidas y sobras.

Ejemplos:

- arroz sobrante → salteado del viernes
- pollo sobrante → wraps, ensalada, bocadillos
- verduras asadas → crema o acompañamiento
- patata cocida → tortilla o puré
- carne picada cocinada → pasta o pizza
- garbanzos o lentejas → ensalada o salteado

Esto implica que el modelo de datos debe contemplar:
- recetas que generan sobras
- recetas que usan sobras
- ingredientes o preparaciones reutilizables
- vínculos entre comidas

---

## Cenas anti-pedir comida

La app debe considerar ciertas cenas como estratégicas para reducir pedidos fuera.

Cenas tipo:
- tortilla
- wraps
- ensaladas completas
- crema + tostadas
- pizza casera rápida
- bocadillos completos

Estas cenas deben poder marcarse como:
- rápidas
- fáciles
- anti-delivery
- bajo esfuerzo

---

## Lista de compra semanal base

La app debe poder construir una lista agrupada por categorías como esta.

### Proteínas
- Pollo: 2,3 kg
- Pavo: 600 g
- Carne picada: 1,2 kg
- Merluza: 700 g
- Atún en lata: 4 latas
- Huevos: 30 unidades
- Yogur natural o skyr: 4–5 kg total
- Queso fresco: 400 g
- Mozzarella rallada: 200 g
- Jamón cocido o pavo lonchas: 300–400 g

### Legumbres
- Lentejas secas: 300 g o 2 botes grandes
- Garbanzos cocidos: 2 botes grandes
- Hummus: 1 bote o casero

### Cereales y carbohidratos
- Avena: 1,5 kg
- Arroz: 1,5 kg
- Pasta integral: 500 g
- Pan integral: 2–3 barras o moldes grandes
- Wraps integrales: 10–12 unidades
- Patatas: 4 kg
- Boniato: 1 kg
- Pan rallado: 1 paquete
- Muesli opcional: 500 g

### Verduras y hortalizas
- Cebollas: 2 kg
- Ajo: 2 cabezas
- Pimientos: 6
- Zanahorias: 2 kg
- Calabacines: 4
- Brócoli: 2
- Lechuga: 2
- Tomates: 12–14
- Pepinos: 2
- Puerro: 2
- Champiñones: 400 g
- Guisantes congelados: 500 g
- Ensalada extra o mezcla verde: 1–2 bolsas
- Limones: 4

### Fruta
- Plátanos: 18–21
- Manzanas: 12
- Naranjas o mandarinas: 10–12
- Fruta extra de temporada: 1–2 kg

### Grasas y básicos
- Aguacates: 4
- Frutos secos: 500 g
- Crema de cacahuete: 1 bote
- Aceite de oliva
- Vinagre
- Sal
- Pimienta
- Pimentón
- Orégano
- Curry
- Comino
- Salsa de soja baja en sal opcional
- Tomate triturado: 5 bricks o latas
- Caldo o pastillas opcional

### Lácteos / bebidas
- Leche o bebida usada en casa: 4–6 litros

---

## Presupuesto orientativo

La app debe dejar sitio para presupuesto estimado y ahorro.

Base aproximada:
- compra semanal base: 110–150 €
- con más pescado, carne premium o extras: 150–180 €

Idea clave:
incluso en un rango alto, suele salir bastante mejor que pedir comida varias veces por semana.

---

## Regla funcional de éxito

La app debe ayudar a que un hogar pueda hacer esto:

1. seguir una semana base sin improvisar
2. comprar desde una lista clara
3. cocinar una sola base para todos
4. ajustar raciones sin cocinar aparte
5. aprovechar sobras
6. tener cenas rápidas
7. reducir pedidos de comida fuera

---

## Implicaciones para el modelo de datos

El dominio del MVP debería soportar al menos:

- Household
- HouseholdMember
- Goal
- WeeklyPlan
- PlannedDay
- MealSlot
- Recipe
- RecipeIngredient
- RecipeStep
- PortionAdjustment
- ShoppingList
- ShoppingCategory
- ShoppingItem
- BatchCookingBlock
- Leftover
- QuickDinnerFlag

---

## Implicaciones para la UI

El MVP debe reflejar visualmente:

- onboarding del hogar
- menú semanal con bloques por comida
- detalle de receta
- modo cocinar paso a paso
- lista de compra agrupada
- señales visuales para:
  - batch cooking
  - sobras
  - cena rápida
  - ajuste por persona

---

## Nota para implementación

Este documento debe usarse como guía funcional del dominio inicial.
No sustituye a `PRD.md`, sino que lo complementa con lógica real de comidas, compra, sobras y planificación semanal.
