# Biblioteca ampliada

La biblioteca contiene las 33 recetas originales y 67 preparaciones nuevas con nombres e identificadores descriptivos de MenumIA. El material temporal de `codex-input/` se utiliza solamente como entrada editorial y no se importa ni distribuye con la aplicación. Las nuevas preparaciones son adaptaciones domésticas: no se presentan como recetas oficiales ni se publican nombres de marca, etiquetas comerciales, afirmaciones nutricionales ni garantías sobre alergias.

## Datos y cantidades

`lib/data/expanded-recipes.json` contiene datos de dominio revisables, tipados mediante `expanded-recipes.ts`. Las cantidades conservan la proporción del material original: `baseServings: 3` es la referencia de esa proporción, nunca el tamaño del hogar. El mismo escalado de todas las recetas determina cantidades para cualquier número de comensales. No hay rendimientos fijos en los pasos: la calabaza se divide proporcionalmente y tortitas/bolitas se forman con la masa disponible.

Se normalizan unidades plurales; las cucharaditas se convierten a 5 ml. Se elige un ingrediente concreto cuando la entrada contenía alternativas y se conservan las alternativas en sustituciones. No se confunden productos cocidos y secos, distintas piezas de carne ni preparaciones como hummus y sus ingredientes. Sal y condimentos de acabado son cualitativos; agua medida para ajoblanco/tahini, especias de repostería y aceites medidos para emulsiones mantienen cantidades exactas. Se añaden ingredientes ausentes que los pasos necesitan, incluida levadura para el bizcocho de zanahoria. Los tiempos son estimaciones de preparación y cocción; los reposos, refrigeración y remojos pueden añadir tiempo y figuran en los pasos.

`catalogMetadata` separa tipo, temporada y comidas compatibles. Es JSONB persistido en `recipes.catalog_metadata`. Las recetas antiguas sin metadatos conservan su compatibilidad original y se consideran de todo el año; sus registros no se sobrescriben.

| Tipo | Nuevas |
| --- | ---: |
| Boles y ensaladas | 10 |
| Proteínas | 7 |
| Guarniciones | 17 |
| Para compartir | 9 |
| Desayunos | 12 |
| Salsas | 6 |
| Postres | 6 |

## Importación aditiva

La primera consulta de catálogo de cada proceso prepara la columna mediante `ALTER TABLE recipes ADD COLUMN IF NOT EXISTS catalog_metadata jsonb` y añade solo identificadores ausentes en lotes de 20. Se usa `ON CONFLICT DO NOTHING`: ni las recetas antiguas ni las nuevas ya guardadas se actualizan. La inicialización se comparte entre solicitudes del mismo proceso. Un fallo permite reintentar y una importación parcial continúa con los identificadores pendientes.

La migración `drizzle/0001_recipe_catalog_metadata.sql` registra el mismo cambio aditivo para mantener el historial de esquema. Su SQL es idempotente también si la aplicación ya ha creado la columna. La preparación automática es una decisión acotada del MVP para que una preview pueda usar el catálogo sin un paso manual de infraestructura. El usuario de BD necesita permiso para añadir esa columna. Si en el futuro se limita ese permiso, habrá que aplicar la migración en el despliegue y retirar la preparación automática.

**Una preview conectada a la BD compartida añade esas recetas a esa misma BD cuando abre el catálogo.** La app anterior conserva sus columnas y recetas; al consultar toda la tabla puede ver los nuevos registros. Volver a desplegar una versión anterior no elimina recetas importadas. No se ha ejecutado aquí ninguna conexión ni importación a la BD online.

Las modificaciones editoriales futuras del JSON no actualizan automáticamente filas ya importadas: requieren una actualización de datos explícita y revisada. La inserción por identificador evita duplicados de esta ampliación; no intenta detectar duplicados semánticos de recetas creadas por otros medios.

## Uso

`/recipes` permite buscar por título o ingredientes sin distinguir mayúsculas o tildes, y filtrar por tipo, temporada y duración. Los filtros de una estación incluyen preparaciones de todo el año. Se muestran 20 resultados cada vez para evitar una lista enorme en móvil. El mismo navegador se usa en el editor semanal, restringido a comidas compatibles.

Los boles se pueden elegir para comida y cena; los desayunos para desayuno o merienda y los postres para merienda. Las proteínas, guarniciones, salsas y entrantes tienen ficha y modo cocinar, pero no se ofrecen como sustituto de una comida completa. Componer proteína + guarnición y enlazar salsas reutilizables queda para la siguiente fase; no se cambia el modelo de un único `recipeId` por bloque. Las salsas que aparecen como ingrediente se compran como preparación, no se expanden automáticamente.

## Validación

Pruebas de integridad de las 100 recetas, escalado de todas las nuevas para 1/2/4/7 personas, consolidación en la compra semanal, búsqueda, temporadas, compatibilidad y renderizado de biblioteca/editor. Se mantienen las pruebas de raciones y lista de compra existentes. La importación online y la navegación con una sesión real se comprueban en la preview; las pruebas locales no acceden a credenciales ni a la BD compartida.
