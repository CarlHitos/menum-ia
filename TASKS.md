# TASKS

## Próxima mejora — Edición del hogar y comidas del día

Prioridad: alta. Pendiente de implementar; registrar esta tarea no habilita la edición actual.

- [ ] Crear un acceso funcional a «Editar mi hogar», con una pantalla de ajustes independiente del onboarding inicial.
- [ ] Permitir activar y desactivar desayuno, media mañana, comida, merienda y cena después de configurar el hogar.
- [ ] Mostrar el número de comidas seleccionadas y cargar siempre las preferencias guardadas del hogar.
- [ ] Guardar los cambios en el hogar existente, sin crear otro hogar ni rehacer su configuración.
- [ ] Actualizar la semana activa conservando las recetas y los comensales de los bloques existentes; añadir los momentos que falten y excluir los desactivados del menú y la compra.
- [ ] Conservar las elecciones de un bloque desactivado para recuperarlas al reactivarlo y dejar la semana pendiente de revisión cuando cambien sus comidas.
- [ ] Verificar que el contador diario, el menú y la lista de compra coincidan después de guardar y recargar.
- [ ] Ampliar los ajustes para editar nombre del hogar, miembros, objetivos, alergias, restricciones, preferencias, presupuesto y tiempo disponible para cocinar.
- [ ] Preservar los identificadores de los miembros al editarlos, para mantener los ajustes de ración y las referencias existentes.

Criterio de aceptación inicial: un hogar con cuatro comidas puede activar merienda y pasar a cinco desde sus ajustes, guardar, recargar y ver el nuevo bloque y su compra sin perder sus comidas anteriores. También puede desactivarla y recuperar su elección al reactivarla.

Estado actual: la lógica de momentos de comida y guardado admite cambios, pero el botón «Editar mi hogar» está deshabilitado y `/onboarding` redirige al menú si el hogar ya existe. La primera entrega debe cerrar este acceso y flujo de edición; la edición completa de miembros puede hacerse después.

Las listas generales que siguen contienen tareas históricas pendientes de revisar: algunas funcionalidades ya están implementadas y sus casillas aún no reflejan el estado actual.

## Inmediato
- [ ] Revisar la estructura actual del proyecto
- [ ] Alinear el proyecto con `PRD.md`
- [ ] Proponer arquitectura del MVP antes de cambios grandes
- [ ] Definir rutas base
- [ ] Definir componentes reutilizables principales
- [ ] Definir modelo de datos inicial

## MVP UI
- [ ] Crear landing simple
- [ ] Crear onboarding del hogar
- [ ] Crear flujo para miembros del hogar
- [ ] Crear dashboard semanal clickable
- [ ] Crear vista de receta
- [ ] Crear modo cocinar
- [ ] Crear lista de compra por categorías

## Producto
- [ ] Soportar ajustes de ración por persona
- [ ] Soportar batch cooking
- [ ] Soportar aprovechamiento de sobras
- [ ] Permitir repetir semanas

## Datos y auth
- [ ] Añadir login
- [ ] Añadir OAuth
- [ ] Añadir persistencia
- [ ] Guardar configuración del hogar

## Más adelante
- [ ] Chat IA contextual
- [ ] Recomendaciones automáticas
- [ ] Presupuesto y ahorro estimado
- [ ] Historial y favoritos
