# Editor de comidas en bottom sheet

El lápiz del plan semanal abre un diálogo modal con el momento de comida y la
fecha de su bloque. En móvil ocupa la altura disponible con márgenes pequeños;
en pantallas grandes se centra.
Sustituye al editor inline y no desplaza el menú para buscar alternativas.

## Componentes y comportamiento

- `components/ui/bottom-sheet.tsx`: diálogo nativo en un portal, foco contenido,
  cierre mediante Cancelar, Escape o fondo, bloqueo del scroll de la página y
  restauración del foco y de la posición exacta al desmontar.
- `features/week-menu/meal-editor-sheet.tsx`: borrador local de comensales,
  recuperación del tamaño del hogar y acciones para aplicar o cancelar.
- `features/recipes/recipe-browser.tsx`: conserva el navegador de biblioteca e
  incorpora un modo compacto con filtros de tipo, tiempo y dificultad; resultados
  con scroll independiente, búsqueda y botones explícitos de Reemplazar.
- `features/dashboard/dashboard-client.tsx`: sustituye el editor inline por el
  modal y guarda receta y comensales juntos a través de la cola existente. El
  aviso de guardado no ocupa espacio en el flujo del documento.
- `lib/domain/recipe-library.ts`: añade el filtro de dificultad sin cambiar las
  reglas de disponibilidad ni la compatibilidad con cada momento de comida.

Cancelar, Escape y pulsar fuera descartan el borrador sin guardar. Reemplazar
aplica la nueva receta y los comensales seleccionados en una sola actualización.
Guardar comensales mantiene la receta y aplica solo el cambio de raciones. La
semana queda en borrador, conservando el comportamiento de revisión existente.

El guardado sigue siendo optimista: al aplicar se cierra el modal; si la petición
falla, el plan conserva el cambio local y muestra el error y Reintentar existentes.
No hay cambios de esquema, migraciones ni nuevos endpoints.

## Distribución móvil compacta

El modal deja 8 px a los lados y abajo y 16 px arriba, ampliando esos márgenes
cuando las áreas seguras del dispositivo lo requieren. Todas las esquinas están
redondeadas y el fondo sigue difuminado. En escritorio conserva el tamaño máximo
y la posición centrada.

La cabecera separa «Cambiar desayuno» y la fecha en una línea secundaria. Los
comensales conservan su caja con fondo y esquinas redondeadas, con botones
circulares de 40 px con iconos vectoriales centrados y un número más pequeño; la zona táctil se amplía a 44 px.
La búsqueda permanece visible. Los filtros empiezan plegados: abrirlos no borra la selección y su
resumen indica cuántos siguen activos. «Limpiar filtros» restablece tipo, tiempo
y dificultad, conservando la búsqueda.

El contador de resultados comparte la fila de Filtros. La altura liberada se
destina a las alternativas, cuyo scroll sigue siendo independiente del plan.

## Validación

Pruebas de filtros combinados y suite existente, lint, TypeScript y build.
Las pruebas de ingredientes se adaptan al requisito previo de mostrarlos solo en
el detalle de receta, sin repetirlos en modo cocinar.

Comprobación de componentes reales del dashboard en Chromium, con datos y
peticiones de guardado simulados: contexto de comida/fecha, cancelación sin
escrituras, Escape, foco y scroll restaurados, comensales como borrador, búsqueda,
filtros, scroll interno, sustitución con raciones y guardado de solo comensales.
Esta comprobación no accede a la BD ni prueba el login real del preview.

La distribución compacta se ha revisado a 390 × 844, 320 × 568 y 1200 × 900 px,
incluidos filtros plegados, conservación de filtros activos, cierre y guardado.
Las medidas reales de la lista dependen del título, los controles desplegados y
las áreas seguras del dispositivo.
