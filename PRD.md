# MenumIA — Product Requirements Document

## 1. Resumen

MenumIA es una app mobile-first para planificación de comidas en hogares.

Su objetivo es ayudar a familias o personas que viven juntas a:
- comer más sano
- gastar menos en supermercado y comida a domicilio
- organizar mejor el menú semanal
- cocinar de forma más simple
- aprovechar sobras
- adaptar la alimentación a los objetivos de cada persona del hogar

La app no debe sentirse como una app de dieta extrema ni como una simple lista de recetas. Debe sentirse como una herramienta práctica, moderna y útil para el día a día.

---

## 2. Problema

Muchas personas:
- gastan mucho dinero en supermercado
- aun así comen mal
- improvisan constantemente
- piden comida por cansancio o falta de planificación
- no tienen claro qué comprar
- no reaprovechan sobras
- no pueden adaptar fácilmente un mismo menú a personas con objetivos distintos

---

## 3. Propuesta de valor

MenumIA genera una experiencia clara para organizar la alimentación del hogar completo desde un único sistema.

La app debe permitir:
- configurar el hogar y sus miembros
- definir objetivos personales
- tener un menú semanal claro y clickable
- cocinar siguiendo pasos simples
- generar una lista de la compra agregada
- reducir pedidos de comida fuera
- reaprovechar sobras y cocinar por lotes
- guardar preferencias y configuraciones
- en el futuro, usar un chat IA que conozca todo el contexto del hogar

---

## 4. Usuarios objetivo

### Usuario principal
Personas que viven solas, en pareja o en hogar compartido y quieren:
- ahorrar
- organizar la comida
- comer mejor
- simplificar la cocina

### Casos típicos
- hogar con 2 o 3 personas
- objetivos físicos distintos entre miembros
- poco tiempo entre semana
- uso frecuente desde smartphone
- compra en supermercados habituales tipo Lidl, Mercadona, etc.

---

## 5. Principios de producto

- Mobile-first
- Muy fácil de usar
- Visualmente moderna y limpia
- Pensada para uso real diario
- Una sola base de cocina para todo el hogar
- Ajustes por persona sin obligar a cocinar 3 comidas distintas
- Reutilización de sobras y batch cooking como parte central
- Enfoque práctico, no extremo

---

## 6. Funcionalidades principales

### 6.1 Onboarding del hogar
Al iniciar la app, debe preguntar:
- cuántas personas forman el hogar
- nombre de cada persona
- edad opcional
- objetivo de cada persona
- restricciones alimentarias
- alergias
- alimentos que no gustan
- presupuesto semanal aproximado
- tiempo disponible para cocinar
- número de comidas a planificar
- supermercado habitual
- preferencia por repetir semanas o variar

### 6.2 Menú semanal clickable
La app debe mostrar una semana completa con:
- desayuno
- media mañana opcional
- comida
- merienda opcional
- cena

Cada bloque del menú debe ser clickable.

Al pulsar una comida, el usuario debe poder ver:
- nombre del plato
- ingredientes
- cantidades
- pasos
- tiempo estimado
- ajustes por persona
- si genera sobras
- si reutiliza sobras previas

### 6.3 Vista de receta
Cada receta debe incluir:
- ingredientes
- cantidades base
- cantidades escalables
- pasos claros
- tiempo total
- utensilios
- porciones
- categoría
- etiqueta de dificultad
- información de batch cooking
- posibles sustituciones

### 6.4 Modo cocinar
Modo visual paso a paso con:
- un paso cada vez
- checkboxes
- timers
- progreso visual
- navegación simple
- diseño cómodo para móvil en cocina

### 6.5 Lista de la compra
Generada automáticamente desde el menú semanal.

Debe estar agrupada por categorías:
- proteínas
- legumbres
- cereales y carbohidratos
- verduras y hortalizas
- fruta
- grasas y básicos
- lácteos / bebidas

Debe permitir:
- tachar elementos
- editar cantidades
- marcar comprados
- añadir elementos manualmente

### 6.6 Ajustes por persona
La app debe permitir que una misma receta tenga una base común, con ajustes por miembro del hogar.

Ejemplo:
- Carlos: más carbohidrato/proteína
- Mandy: menos carbohidrato, misma base
- Sergi: ración intermedia

No se deben generar 3 menús independientes por defecto.

### 6.7 Batch cooking y aprovechamiento
La app debe poder marcar:
- recetas base
- comidas preparables en lote
- sobras reutilizables
- cenas rápidas anti-pedir comida

Debe existir una lógica clara para:
- cocinar fuerte 1 o 2 veces por semana
- reutilizar arroz, pollo, verduras, patata, etc.
- transformar sobras en nuevas comidas

### 6.8 Perfil del hogar
Debe guardarse:
- miembros
- objetivos
- restricciones
- preferencias
- presupuesto
- historial de semanas
- recetas favoritas

### 6.9 Login y persistencia
La app debe incluir login para guardar datos y configuraciones.

Requisitos:
- autenticación real
- OAuth desde etapas tempranas
- datos persistentes por usuario/hogar

### 6.10 Chat IA contextual (futuro)
En una fase posterior, la app debe incluir un chat IA que conozca:
- miembros del hogar
- objetivos
- alergias y restricciones
- plan semanal actual
- recetas
- lista de compra
- sobras
- presupuesto

Ejemplos:
- “cámbiame la cena del jueves”
- “haz la compra más barata”
- “dame una alternativa sin pescado”
- “aprovecha el pollo que sobra”

---

## 7. Requisitos UX/UI

La interfaz debe ser:
- moderna
- cálida
- limpia
- visualmente clara
- rápida
- usable con una mano en móvil

### Estilo visual deseado
- diseño mobile-first
- tarjetas grandes
- jerarquía visual clara
- colores suaves
- sensación de orden y calma
- navegación simple
- look moderno tipo producto SaaS / app lifestyle

### La app no debe parecer:
- una app médica
- una app de culturismo agresiva
- una simple hoja de cálculo
- una app recargada

---

## 8. MVP

El MVP debe incluir:

1. onboarding del hogar
2. menú semanal clickable
3. vista de receta
4. lista de compra por categorías
5. modo cocinar paso a paso
6. diseño mobile-first moderno
7. persistencia de datos básica
8. login

No incluir todavía:
- chat IA completo
- automatización muy avanzada
- analítica nutricional compleja
- infraestructura enterprise

---

## 9. Roadmap de producto

### V1
- onboarding
- hogar y miembros
- menú semanal
- recetas
- lista de compra
- modo cocinar
- login
- persistencia

### V1.5
- favoritos
- repetir semana
- historial de semanas
- recetas propias
- compartir hogar

### V2
- chat IA contextual
- generación dinámica de semanas
- más automatización de sobras
- control de presupuesto
- recomendaciones más inteligentes

---

## 10. Requisitos técnicos

### Stack inicial recomendado
- Next.js
- TypeScript
- Tailwind
- App Router
- despliegue en Vercel al principio
- auth y base de datos desacopladas del hosting

### Principios técnicos
- arquitectura portable
- preparada para crecer
- evitar acoplamiento excesivo a Vercel
- backend y datos listos para migración futura si crece
- modelo de datos claro desde el principio

### Escalabilidad
No hace falta montar AWS desde el primer día, pero la app debe diseñarse para que en el futuro sea posible migrar infraestructura o crecer sin rehacer todo.

---

## 11. Modelo conceptual inicial

Entidades principales:
- User
- Household
- HouseholdMember
- Goal
- Restriction
- Allergy
- WeeklyPlan
- DayPlan
- Meal
- Recipe
- RecipeStep
- ShoppingList
- ShoppingItem
- BatchCookingBlock
- Leftover

---

## 12. Base funcional inicial inspirada en el caso real

La app debe soportar este tipo de lógica real:
- muchas personas en un mismo hogar
- objetivos diferentes
- una misma base de menú para todos
- ajuste de raciones por persona
- desayunos rotativos
- comidas y cenas semanales
- recetas repetibles
- lista de compra total semanal
- aprovechamiento de sobras
- cenas rápidas para evitar pedir comida fuera

---

## 13. Criterios de éxito del MVP

El MVP será exitoso si un hogar puede:
- completar el onboarding sin fricción
- ver su semana de comidas claramente
- abrir una receta y cocinarla
- usar la lista de compra real
- sentir que la app reduce improvisación
- sentir que la app ayuda a gastar menos y pedir menos comida fuera
