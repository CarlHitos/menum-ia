# Validación de sesiones y cuentas eliminadas

## Comportamiento

La sesión mantiene la estrategia JWT y su duración actual. Cada lectura de sesión
valida el identificador del token contra la tabla de usuarios, sin cachear la
existencia de la cuenta entre peticiones.

Si la cuenta ya no existe, el callback devuelve una sesión sin `user` y retira
`sub` del token renovado. Las páginas protegidas redirigen al login y las API de
hogar, semana y compra responden `401` mediante sus comprobaciones existentes.
La página de login solo redirige a su destino cuando existe `session.user.id`.

El login de una cuenta eliminada limpia el borrador local de esa cuenta (versiones
v1, v2 y v3 y marca de finalización), cierra la sesión mediante `signOut` y recarga
la página para mostrar el acceso con Google. El borrador de otras cuentas y el
borrador de una cuenta válida se conservan. La limpieza local ocurre en el
navegador/origen que visita el login, no remotamente en todos los dispositivos.

Una nueva cuenta con el mismo correo no hereda la sesión anterior: se comprueba
el identificador de usuario, no el correo. Un token marcado como inválido no se
reactiva. Un error de BD impide continuar la autenticación, pero no se interpreta
como cuenta eliminada ni provoca la limpieza de su borrador.

No se modifica el esquema, no hay migraciones y no se modifica ningún dato de
producción para probar este cambio. La comprobación añade una consulta de usuario
por lectura de sesión. No invalida contenido ya renderizado sin una nueva
petición al servidor.

## Validación

`tests/session-validation.test.ts` comprueba las cuentas existentes, la eliminación
tras emitir una sesión, el registro con el mismo correo, los tokens revocados,
los tokens sin identidad, los errores de BD y el aislamiento de la limpieza local.
Estas pruebas usan datos simulados y no acceden a la BD real.

Comprobación manual pendiente en un preview con una cuenta de prueba:

1. Iniciar sesión y escribir un borrador de hogar sin guardarlo.
2. Recargar con la cuenta existente: debe conservarse el borrador.
3. Eliminar la cuenta de prueba y recargar `/onboarding`: debe ir al login,
   cerrar la sesión anterior y permitir continuar con Google.
4. Conservar una cookie de esa sesión anterior y comprobar que las operaciones
   de hogar, semana y compra responden `401`, sin escribir datos.
5. Registrarse nuevamente: debe crearse una sesión de la nueva cuenta y el
   borrador anterior no debe reaparecer.
