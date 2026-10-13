# Recetas independientes para la V1

La V1 planifica y calcula la compra de cada comida de forma independiente. La reutilización de preparaciones entre días queda para una fase posterior. Se conservan las recetas y sus identificadores, así como los metadatos internos de batch cooking, rendimientos y relaciones de sobras. Estos metadatos no modifican las cantidades, no se presentan como una función disponible y no justifican reservar comida de otra receta.

## Adaptación del catálogo y de filas existentes

`lib/domain/standalone-recipes.ts` concentra las correcciones editoriales de las recetas originales. Se aplica al catálogo exportado y a las recetas leídas desde BD mediante `normalizeRecipeForServings`. Así los registros ya importados reciben las mismas instrucciones que una instalación nueva, sin actualizaciones masivas ni sobrescritura de filas de BD. La transformación es idempotente y conserva `baseServings`: todas las cantidades siguen escalando con los comensales de cada bloque.

Los campos corregidos de estas recetas del catálogo son comunes para toda la V1. Si en el futuro se permite editar recetas o se añade reutilización real, habrá que revisar esta adaptación y versionar sus cambios. Los datos originales se conservan en el catálogo interno y las filas existentes.

## Revisión de las nueve recetas con metadatos de reutilización

| Receta | Comportamiento de la V1 |
| --- | --- |
| Arroz con pollo y verduras | Cuece el arroz y cocina todo el pollo y las verduras para esta comida; no reserva raciones. |
| Tortilla de patata y calabacín | Ya tiene ingredientes y pasos independientes; su nota interna de sobras permanece sin mostrarse. |
| Lentejas guisadas | Ya se cocinan para esta comida; su nota interna de cocinar extra permanece sin mostrarse. |
| Wraps de pollo | Cocina el pollo en la sartén en lugar de recuperarlo de otra comida; estimación de 20 minutos. |
| Pasta con carne y tomate | Cocina y consume su propia salsa, sin reservarla para otra cena. |
| Crema de verduras con tostadas | Ya tiene preparación independiente; se mantiene la compra para las raciones seleccionadas. |
| Salteado de arroz y pavo | Incluye un paso para cocer el arroz indicado en seco y preparar las verduras; añade cazo y estima 35 minutos. |
| Pizza rápida | Prepara su propia salsa con carne picada y tomate triturado; añade sartén, un paso de salsa y estima 30 minutos. |
| Pollo con boniato y ensalada | Cocina y reparte las cantidades de esta comida, sin instrucciones de reservar para la semana. |

También se simplifica la descripción del desayuno de avena para evitar la referencia a cocinar de más. Los tiempos son estimaciones de preparación y cocción; los timers son ayudas y deben contrastarse con el punto de los alimentos y las instrucciones del envase.

## Pizza y lista de compra

Se sustituye el ingrediente antiguo «Salsa de carne» por sus ingredientes de compra. La adaptación editorial usa la proporción `250 g de salsa de referencia → 150 g de carne picada + 200 g de tomate triturado`, y después aplica el escalado normal por comensales. Es una propuesta de composición para esta pizza, no una conversión universal de peso cocido a crudo.

Si el menú incluye pasta y pizza, sus necesidades de carne picada y tomate triturado se agregan por producto. Se conserva la precisión antes del redondeo de compra y no se descuenta ninguna supuesta sobra. Las fichas, modo cocinar y lista de compra leen la misma receta adaptada.

## Descripciones del menú

El menú muestra `recipe.description`. Se retira la descripción automática por etiquetas del bloque, que hacía aparecer «Ideal para cocinar de más…» o «Perfecta para aprovechar…» incluso después de cambiar la receta. Las etiquetas, bloques de preparación y enlaces permanecen como datos internos sin activar reutilización. La cena genérica de aprovechamiento sigue oculta.

Los ingredientes comprados ya preparados, como garbanzos cocidos, hummus o mayonesa, continúan siendo válidos. No se interpreta que procedan de otro día ni se expanden automáticamente como componentes compartidos.

## Validación

Pruebas de recetas activas sin referencias de reutilización entre comidas, adaptación de filas antiguas, idempotencia, conservación de datos originales, escalado de los ingredientes de pizza, agregación de compra con pasta, descripciones después de sustituir recetas y coherencia entre ficha y modo cocinar. Se mantienen las pruebas existentes de catálogo, cantidades, navegación y momentos de comida.

No se conecta a la BD online durante las comprobaciones locales. El flujo completo con la sesión y lista de compra guardadas se revisa en la preview de Vercel.
