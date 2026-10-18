# Detalle de receta y modo cocinar

## Ajustes de interfaz

- Detalle: regreso explícito al menú o a la biblioteca según el contexto de entrada,
  singular/plural de comensales, título «Pasos a seguir» y un único CTA inferior
  «Abrir modo cocinar» a todo el ancho útil de la tarjeta.
- Cocinar: salida explícita a la receta manteniendo `planId` y `slotId`, singular
  de ración al servir y navegación compacta de pasos mediante botones numerados.
  La tarjeta activa muestra únicamente el título de la acción; el contexto de
  paso se mantiene en los chips, el progreso y las etiquetas accesibles. Los
  ingredientes se consultan en el detalle de receta, sin repetirlos al cocinar.
- Al completar todos los pasos, la tarjeta de éxito sustituye al paso activo,
  temporizador y controles de pasos. Muestra «Sirve la preparación
  (1 ración)» o su plural, un único CTA «¡A comer!» y una opción para revisar.
- Revisar conserva los pasos completados; permite saltar a cualquiera, deshacer
  su finalización y volver al resumen final. Los temporizadores se detienen al
  completar un paso y se reinician al seleccionar otro, como en la navegación
  anterior. No se añade persistencia de progreso.

## Cantidades de presentación

`features/recipes/ingredient-amount.ts` formatea los ingredientes del detalle.
Expresa unidades habituales como fracciones (por ejemplo, `0.67 ud` como `2/3 ud`)
y cantidades fraccionarias de peso/volumen con incrementos prácticos. Conserva
los gramos/mililitros enteros y la precisión útil de ingredientes pequeños:
`8.33 g` se muestra como `≈ 10 g`, `1.67 g` como `≈ 1,7 g` y cantidades positivas
inferiores a `0.1 g/ml` como `< 0,1 g/ml`.

El símbolo `≈` identifica los redondeos de peso/volumen. Este formato nunca se
utiliza como entrada para el escalado, agregación semanal, compra o persistencia.
Las reglas de compra existentes no cambian: no se redondean ingredientes por
receta antes de sumarlos. «Al gusto» y «Según necesidad» se conservan.

## Validación

- Pruebas de formato y conservación de las cantidades originales/escaladas en
  `tests/recipe-amount.test.ts`, además de la suite existente.
- Lint, TypeScript y build de producción.
- Comprobación de componentes aislados en Chromium a 390 × 844 con datos de
  prueba: detalle, CTA, navegación entre pasos, temporizador, finalización,
  revisión y deshacer; sin errores de navegador ni desbordamiento horizontal.
- Esta prueba aislada no sustituye una comprobación del preview con sesión y
  datos reales. No se modifican autenticación, esquema ni datos de BD.
