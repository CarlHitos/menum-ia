# Momentos de comida

El orden del menú es desayuno → media mañana → comida → merienda → cena. El hogar elige qué momentos planificar. Media mañana usa `mid-morning`; merienda conserva `snack`, por compatibilidad con recetas, hogares y semanas existentes. Los tipos, etiquetas y orden se centralizan en `lib/domain/meal-types.ts`.

## Activación y semanas guardadas

Media mañana no se añade a hogares que no la seleccionen. Los borradores antiguos conservan sus cuatro opciones; el validador de borradores actuales reconoce también el quinto momento. Al resolver una semana para un hogar que la haya activado, se añade un bloque por día únicamente donde falte, sin cambiar recetas, identificadores o ajustes de comensales de los otros bloques. Se alternan tres recetas ya disponibles: manzana con crema de almendra, yogur con fruta y semillas, y queso fresco con fruta y nueces.

Cada nuevo bloque usa el número actual de miembros. Los identificadores son estables y se comprueba que no colisionen con los existentes. Una semana que recibe nuevos bloques queda en borrador para revisarla. Al guardar cambios en las comidas del hogar, se sincroniza la última semana guardada y queda pendiente de confirmación.

Desactivar un momento lo excluye de la vista y de la compra. Sus bloques permanecen en el plan completo para recuperar la receta y los comensales al reactivarlo. La adaptación al leer la semana también cubre planes antiguos todavía sin media mañana. Los cambios se guardan en las columnas JSON existentes; no se requieren tablas ni migraciones nuevas.

## Recetas y compra

Las recetas compatibles con merienda se pueden utilizar también en media mañana. La compatibilidad se amplía al interpretar los metadatos, tanto para recetas originales como para filas ya importadas en BD; no se duplican recetas ni se sobrescriben los ingredientes existentes.

Los dos momentos tienen identificadores de bloque diferentes y comensales independientes. Si una receta aparece en ambos, la compra suma sus dos cantidades escaladas antes de aplicar redondeos. Las fichas y el modo cocinar conservan el contexto de cada bloque a través de `planId` y `slotId`.

## Resumen móvil

La tarjeta COMIDAS muestra un contador destacado, por ejemplo «5 / día», en lugar de concatenar nombres. El contador refleja los momentos seleccionados del hogar. HOGAR y COMIDAS comparten altura mínima de 80 px, relleno y alineación centrada; el nombre del hogar ocupa como máximo dos líneas. Los nombres de las comidas se muestran en el menú y en la configuración.

## Comprobaciones

Pruebas de activación opcional, adaptación de semanas antiguas, conservación de recetas/comensales, idempotencia, desactivación/reactivación, cantidades agregadas de mañana y tarde, compatibilidad de recetas y recarga de borradores. Se mantienen las pruebas existentes del catálogo, cantidades, compra y navegación.

El build se comprueba en una copia aislada con variables ficticias. La revisión móvil usa los componentes reales con datos de ejemplo y guardados simulados: alineación con nombres largos, contador de cuatro/cinco comidas, orden, edición y almacenamiento del borrador. La integración con una cuenta y BD reales se revisa en la preview de Vercel.
