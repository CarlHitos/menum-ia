# AGENTS.md

## Contexto del proyecto

Este proyecto es MenumIA, una app mobile-first de planificación de comidas para hogares.

La fuente principal de contexto del producto es `PRD.md`.
Antes de proponer cambios importantes, leer `PRD.md`.

## Objetivo

Construir una app moderna y usable en smartphone para:
- organizar comidas del hogar
- ahorrar dinero
- comer mejor
- planificar menú semanal
- cocinar más fácil
- aprovechar sobras
- adaptarse a objetivos distintos por persona

## Reglas importantes

- Priorizar experiencia mobile-first
- Mantener UI moderna, limpia y clara
- Priorizar componentes reutilizables
- No convertir la app en una simple app de recetas
- No modelar dietas separadas por persona por defecto
- Usar una base común de comidas con ajustes de ración por persona
- Tener en cuenta batch cooking y aprovechamiento de sobras
- La lista de compra es una funcionalidad principal, no secundaria
- El modo cocinar es una funcionalidad principal, no secundaria

## MVP actual

El MVP debe incluir:
- onboarding del hogar
- menú semanal clickable
- vista de receta
- lista de compra por categorías con checkboxes
- modo cocinar paso a paso con timers
- login
- persistencia básica

## Qué no hacer todavía

No implementar todavía:
- chat IA completo
- automatizaciones muy avanzadas
- arquitectura excesivamente compleja
- microservicios
- infraestructura enterprise

## Enfoque técnico

- Mantener estructura clara y escalable
- Favorecer separación entre UI, lógica de dominio y datos
- Preparar el proyecto para auth y persistencia reales
- Evitar decisiones que dificulten futura migración de infraestructura

## Antes de hacer cambios grandes

Si una tarea implica reorganizar rutas, modelo de datos o arquitectura, primero proponer un plan breve antes de implementar.
