# Revisión de la experiencia de planificación y onboarding

## Flujo de menú

La pantalla empieza con las fechas y una instrucción para revisar las comidas. El selector de días, las comidas y el editor aparecen antes de la tarjeta de confirmación. No es obligatorio abrir todos los días: la revisión es una ayuda, no una validación bloqueante.

La acción principal es «Confirmar y ver la compra». Confirma mediante el guardado existente y espera a que termine la cola de guardado antes de navegar. Si falla, permanece en el menú, muestra el error y lleva el foco hasta la opción de reintentar. La compra provisional continúa disponible. La confirmación no impide modificar el menú más adelante.

Los mensajes distinguen «Revisa tu menú», «Has modificado tu menú» y «Menú confirmado», evitando términos como «bloque» y «cambios sobre semana activa» en las instrucciones de uso.

El día elegido se conserva durante la sesión del navegador por hogar y semana. Antes de abrir una receta se guarda la posición para restaurarla al volver al menú. No se almacenan estos datos de vista en BD; si sessionStorage no está disponible, se mantiene la navegación y se usa el día inicial. Cambiar de día cierra el editor de la comida anterior. Al sustituir una receta o cerrar la edición con «Volver al menú», el foco vuelve a su tarjeta.

## Formularios y pasos

`InputCard` mantiene la tarjeta exterior y añade un campo interior con fondo contrastado, borde, resaltado de foco, placeholder atenuado y cursor de texto. Los errores conservan su color y se relacionan con el campo mediante `aria-describedby`.

El onboarding muestra «Persona X de Y» desde el primer miembro. «Siguiente persona» distingue la transición entre miembros. Al cambiar de paso o miembro se desplaza al inicio del nuevo contenido y se mueve el foco a una región que no abre el teclado. Los grupos de opciones inválidos también reciben foco. Escribir o seleccionar preferencias no reinicia el desplazamiento.

El modo cocinar reutiliza la misma navegación al cambiar de paso; los timers y checkboxes no producen desplazamientos por sí solos. El movimiento respeta `prefers-reduced-motion`.

El resumen del hogar invita a revisar y guardar la configuración mediante «Preparar mi menú semanal». Explica que después se elige la fecha y se revisan las comidas. Se retiran la afirmación de haber generado ya un menú inteligente y la estimación de ahorro que no estaba calculada.

## Validación y alcance

No se cambian tablas, cantidades, recetas ni autenticación. Se mantienen las pruebas existentes de recetas, raciones y compra. Las pruebas de navegación comprueban separación entre hogares/semanas, retorno único de la posición, recuperación ante storage bloqueado y movimiento reducido.

La comprobación de navegador móvil usa los componentes reales en una copia temporal con hogares ficticios, rutas de ejemplo y respuestas de guardado simuladas: campos interactivos, navegación entre miembros/pasos, jerarquía del menú, retorno desde una receta, error de guardado y reintento. La navegación con sesión y BD reales queda para la preview de Vercel.
