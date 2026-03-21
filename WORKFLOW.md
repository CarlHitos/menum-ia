# WORKFLOW

## Objetivo

Este documento define la metodología de trabajo del proyecto MenumIA para mantener un desarrollo ordenado, escalable y fácil de continuar tanto manualmente como con ayuda de agentes como Codex.

El objetivo es evitar cambios caóticos, proteger la rama principal y mantener trazabilidad entre decisiones de producto, arquitectura y código.

---

## Principios de trabajo

- La rama `main` debe mantenerse lo más estable posible.
- No se debe desarrollar directamente en `main` salvo cambios mínimos y controlados.
- Cada bloque de trabajo relevante debe hacerse en una rama separada.
- Antes de cambios grandes, debe existir una propuesta breve de arquitectura o plan de archivos.
- Los cambios deben hacerse en fases pequeñas y verificables.
- Siempre que sea posible, validar con `lint` y `build` antes de cerrar una fase.
- Las decisiones importantes de producto o arquitectura deben quedar reflejadas en documentación del proyecto.

---

## Estrategia de ramas

### Rama principal
- `main`
  - rama estable
  - solo debe recibir trabajo validado
  - debe representar el estado más seguro del proyecto

### Ramas de trabajo
Usar ramas descriptivas según tipo de trabajo:

- `feat/...` para nuevas funcionalidades
- `fix/...` para correcciones
- `refactor/...` para reorganización de código sin cambiar funcionalidad
- `chore/...` para infraestructura, tooling o mantenimiento
- `docs/...` para documentación

### Ejemplos
- `feat/onboarding-persistence`
- `feat/auth-neon-drizzle-foundation`
- `fix/shopping-list-recompute`
- `refactor/domain-week-model`
- `docs/workflow-and-guidelines`

---

## Cuándo crear una rama nueva

Crear una rama nueva cuando:
- se va a tocar una funcionalidad importante
- se va a cambiar estructura o arquitectura
- se va a tocar auth, base de datos o persistencia
- se va a hacer una iteración grande de producto
- se quiere experimentar sin riesgo para `main`

No hace falta rama separada para cambios ínfimos de texto o documentación pequeña, aunque sigue siendo recomendable si el cambio toca varias cosas.

---

## Convención de commits

Usar commits cortos, descriptivos y orientados a intención.

### Prefijos recomendados
- `feat:` nueva funcionalidad
- `fix:` corrección de error
- `refactor:` reorganización sin cambio funcional
- `docs:` documentación
- `chore:` tooling, configuración o mantenimiento
- `style:` cambios visuales menores sin lógica
- `test:` pruebas

### Ejemplos
- `feat: add onboarding local persistence`
- `fix: preserve shopping list checks after plan update`
- `refactor: separate weekly plan runtime from template`
- `docs: add data model and workflow guidelines`
- `chore: add drizzle and auth foundation`

---

## Tamaño de los commits

Preferencias:
- commits pequeños o medianos
- una intención clara por commit
- evitar commits gigantes con cambios mezclados

Evitar:
- mezclar UI + auth + DB + refactor en un solo commit
- hacer commits ambiguos como `changes`, `stuff`, `update`

---

## Flujo recomendado de trabajo

### Para una nueva funcionalidad
1. Crear rama nueva
2. Definir alcance
3. Pedir o redactar plan breve si el cambio es grande
4. Implementar en fases
5. Validar con `lint`
6. Validar con `build` cuando aplique
7. Revisar manualmente
8. Commit
9. Merge a `main` solo cuando esté suficientemente estable

### Para cambios grandes de arquitectura
1. Documentar decisión
2. Crear rama específica
3. Confirmar plan de archivos o capas afectadas
4. Ejecutar por fases
5. Validar cada fase
6. No mezclar con cambios cosméticos innecesarios

---

## Reglas para trabajar con Codex

- No pedir cambios grandes sin contexto del proyecto actualizado.
- Antes de cambios relevantes, Codex debe leer:
  - `PRD.md`
  - `AGENTS.md`
  - `docs/meal-planning-foundation.md`
  - `docs/data-model.md`
  - `WORKFLOW.md`
- Si el cambio afecta arquitectura, dominio, auth o persistencia, primero debe proponer plan.
- Si el cambio es sensible, debe trabajar en rama separada.
- No hacer refactorizaciones destructivas sin confirmación.
- No ampliar el scope de una tarea sin avisar.
- Al final de cada fase importante, debe resumir:
  - archivos tocados
  - decisiones tomadas
  - validaciones hechas
  - límites o riesgos detectados

---

## Validaciones mínimas antes de cerrar una fase

Siempre que sea posible:
- `npm run lint`
- `npm run build`

Y además:
- revisar visualmente si la fase afecta UI
- revisar flujo real si afecta onboarding, menú, compra o cooking
- revisar rutas protegidas si afecta auth
- revisar variables de entorno si afecta infraestructura

---

## Qué documentar

Documentar cuando se tome una decisión importante sobre:
- producto
- dominio
- flujo principal
- auth
- persistencia
- modelo de datos
- estrategia de compra
- lógica de semana activa vs plantilla

Archivos habituales:
- `PRD.md`
- `AGENTS.md`
- `ROADMAP.md`
- `TASKS.md`
- `docs/meal-planning-foundation.md`
- `docs/data-model.md`
- `WORKFLOW.md`

---

## Qué no hacer

- Trabajar directamente en `main` para cambios grandes
- Mezclar varias iniciativas en una sola rama sin control
- Hacer commits enormes y ambiguos
- Cambiar producto, dominio y persistencia a la vez sin fases
- Introducir infraestructura grande sin milestone claro
- Perder decisiones importantes solo en el chat sin reflejarlas en el repo

---

## Regla práctica

Si un cambio parece lo bastante grande como para dar miedo romper algo, debe ir:
- en rama nueva
- con plan breve
- con validación
- y con resumen final

## Manejo de secretos

- Los secretos no deben abrirse ni inspeccionarse desde flujos normales de desarrollo.
- `.env.local` y archivos similares deben tratarse como fuera de alcance para agentes.
- Si una tarea necesita variables de entorno, el usuario debe configurarlas manualmente.

## Pull Requests

- Los cambios relevantes deben integrarse en `main` mediante Pull Request.
- Aunque el proyecto lo lleve una sola persona, la PR actúa como punto de revisión y control de calidad.
- Antes de abrir una PR, validar al menos:
  - `npm run lint`
  - `npm run build`
  - revisión manual básica del flujo afectado
- La PR debe tener un alcance claro y no mezclar iniciativas no relacionadas.
- Si una rama toca auth, DB, persistencia, dominio o arquitectura, la PR es obligatoria antes de mergear a `main`.
