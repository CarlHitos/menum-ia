# TASKS

## Implementado — Resumen de Hogar

Implementado en `feat/home-summary`; pendiente de revisión e integración. Detalles y validaciones en `docs/home-summary.md`.

- [x] Sustituir los textos introductorios del hogar configurado por un saludo con el nombre de la cuenta y un resumen compacto de hogar, supermercado y objetivos; indicar objetivos diversos cuando corresponda.
- [x] Recuperar la marca y el logo en una barra superior, mostrar saludo y metadatos sobre fondo continuo y conservar los integrantes en una fila horizontal de píldoras compactas.
- [x] Mostrar «Menú de hoy» con recetas reales del plan, tiempo y enlaces al detalle con contexto de comida. No inferir una «próxima comida» mientras no existan horarios o estado de comidas realizadas.
- [x] Añadir dos tarjetas en paralelo: «Menú semanal», con estado real y acceso al menú, y «Compra semanal», con progreso de productos marcados y acceso a la lista.
- [x] Contemplar hogares sin plan y planes que no incluyen hoy, sin presentar datos de ejemplo; conservar la bienvenida para usuarios sin hogar configurado.

Criterio de aceptación: al entrar en Hogar se muestran el resumen, las comidas de hoy cuando existen y los accesos con estados reales. El progreso de compra coincide con la lista y los enlaces de receta conservan las raciones del bloque.

## Pendiente — Edición del hogar y comidas del día

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

## Más adelante — Integrantes, objetivos y fotos de perfil

- [ ] Revisar la presentación de Hogar con varios integrantes, nombres largos y distintos objetivos: distribución de píldoras, desplazamiento horizontal y legibilidad en móvil.
- [ ] Definir cómo presentar varios objetivos, conservando la base común de comidas y evitando una cantidad excesiva de píldoras.
- [ ] Vincular explícitamente la cuenta autenticada con su integrante del hogar para usar su foto de Google; no asociar personas por coincidencia de nombre ni asignar la foto del propietario a todos.
- [ ] Permitir cambiar la foto propia y la de integrantes del hogar desde la futura edición de perfiles, con persistencia y permisos adecuados.
- [ ] Mantener la inicial como alternativa cuando no exista una foto o no se pueda cargar.

Estas mejoras quedan fuera de la entrega actual de `feat/home-summary`.

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
- [x] Adaptar las recetas de la V1 para cocinarlas de forma independiente, retirar mensajes de reutilización y alinear la compra; ver `docs/standalone-recipes-v1.md`.
- [ ] Soportar ajustes de ración por persona
- [ ] Soportar batch cooking (fase posterior a la V1)
- [ ] Soportar aprovechamiento de sobras (fase posterior a la V1)
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
