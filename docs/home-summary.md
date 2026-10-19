# Resumen de Hogar

La pantalla `/` mantiene la bienvenida y el acceso a configurar el hogar cuando todavía no existe uno. Los hogares configurados ven un resumen operativo en lugar de párrafos introductorios y funciones futuras deshabilitadas.

## Presentación

- Barra superior de marca MENUMIA en dorado y logotipo oficial.
- Saludo «¡Hola, [nombre]! 👋» con el primer nombre de la cuenta; sin nombre disponible, «¡Hola! 👋».
- Nombre completo del hogar, tienda y objetivo en píldoras informativas con el estilo del rango de fechas del menú: fondo azul grisáceo, borde dorado fino, texto claro e iconos outline de casa, carrito y diana. Se distribuyen en varias líneas cuando no caben; la tienda solo aparece si está configurada. No hay tarjeta gris ni marco exterior. La variante sin marco de `AppShell` se usa solo en Hogar configurado. Si los miembros tienen objetivos distintos, «Objetivos diversos».
- Fila horizontal de integrantes con iniciales y nombres, píldoras en slate y acento dorado; desplazamiento horizontal cuando no caben.
- «Menú de hoy» con las comidas activas del plan, tiempos y enlaces de receta con `planId` y `slotId`.
- Dos accesos en paralelo: estado del menú semanal y progreso de compra, con enlaces a sus pantallas.

## Datos y fechas

`app/page.tsx` obtiene el último plan del hogar autenticado, el catálogo y los checks guardados. `features/home/home-summary-data.ts` reutiliza `applyHouseholdToPlan`, el preview semanal y la misma agregación y reconciliación que la pantalla de compra. Los productos retirados no cuentan y un aumento de cantidad puede dejar un producto pendiente otra vez. No se crean planes ni checks al abrir Hogar.

La selección de hoy se realiza en el dispositivo por fecha local exacta, incluyendo mes y año. No se usa solo el nombre del día de la semana. El bloque se actualiza al recuperar el foco o la visibilidad y cada minuto, para reflejar un cambio de día sin recargar. Durante la hidratación se muestra un estado breve de carga, evitando diferencias de zona horaria con el servidor.

Si no hay plan, se ofrece generarlo. Si la semana no incluye hoy, se indica el rango real del plan; si hoy no tiene comidas, se muestra un estado vacío. No se supone cuál es la próxima comida ni se atribuyen estados de realización todavía inexistentes.

Los enlaces de hoy conservan las raciones del bloque, incluidos sus overrides. Al abrir una receta se recuerda el día de esa comida y se descarta un scroll antiguo del menú, para que «Volver al menú» no restaure otro día de una visita anterior.

## Validación

- Pruebas de fechas exactas y límites del plan, momentos activos, contexto de enlaces y overrides de raciones.
- Pruebas de progreso de compra, aumento de cantidades, aislamiento entre planes y estados vacíos.
- Lint, suite de tests y compilación de producción.
- Revisión visual aislada con datos de prueba a 320, 393 y 402 px: menú de hoy, ausencia de plan, otra semana, enlaces y accesos en dos columnas, sin desbordamiento horizontal.

No hay cambios de esquema ni persistencia nueva. Los checks de comida realizada, los horarios y la edición del hogar siguen fuera de esta entrega. La revisión visual aislada no prueba OAuth ni consultas reales a la BD.
