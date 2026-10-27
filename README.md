# JOTACELL

Catálogo público de celulares y panel administrativo privado. Los productos, fotografías, variantes, IMEI, ventas y cuotas comparten una base PostgreSQL en Supabase mediante Prisma. No hay carrito, pagos online ni integraciones con APIs de mensajería.

Cada ficha pública incluye un botón que abre WhatsApp con el mensaje de consulta ya redactado (equipo, marca, precio, almacenamiento, color, estado y referencia). Es un enlace `wa.me` generado en el navegador a partir del teléfono configurado en el panel: no usa API de WhatsApp ni guarda conversaciones. Si el teléfono está vacío, el botón redirige a la página de contacto.

Todos los precios y cobros se expresan exclusivamente en soles peruanos (PEN, S/). Los importes se almacenan en céntimos enteros.

## Puesta en marcha

1. Instala dependencias: `bun install`.
2. Copia `.env.example` a `.env.local`. Configura `DATABASE_URL` (pooler de transacciones, puerto 6543), `DIRECT_URL` (pooler de sesión, puerto 5432), `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` (Supabase → Project Settings → API Keys). **No publiques este archivo.** No se requiere clave `service_role`.
3. Revisa la migración inicial en `prisma/migrations/20261027_initial/migration.sql`. En una base nueva, ejecuta `bun run db:deploy` y `bun run db:generate`. Si ya hay tablas propias en `public`, haz una copia de seguridad antes de migrar.
4. En Supabase → Authentication → Users, crea manualmente un usuario administrador con correo confirmado y contraseña fuerte (12+ caracteres, mayúscula, minúscula, número y símbolo). Configura esa política y desactiva el registro público en los ajustes de Auth.
5. Copia el correo y **User ID** de ese usuario en `ADMIN_EMAIL` y `SUPABASE_ADMIN_USER_ID` de `.env.local`; ejecuta `bun run admin:setup` para autorizarlo. No uses un UUID desconocido sin confirmar que sea el User ID de Auth.
6. Inicia con `bun run dev`. La tienda está en `/` y el panel privado en `/admin/login`.

> La contraseña de PostgreSQL permanece solo en `.env.local` (ignorado por Git); la contraseña del administrador se guarda en Supabase Auth, nunca en el CRM. Tras compartir una credencial en un chat, rótala en Supabase y actualiza ambas URL locales.

## Operación

| Tarea                                                    | Dónde                                |
| -------------------------------------------------------- | ------------------------------------ |
| Crear un modelo y publicar su ficha                      | Admin → Celulares → Nuevo celular    |
| Subir imágenes y completar especificaciones              | Edición del celular                  |
| Configurar precios, colores, RAM, almacenamiento y stock | Celulares → botón `+` de cada modelo |
| Registrar IMEI                                           | Inventario → IMEI / serie            |
| Registrar venta y generar cuotas                         | Ventas → Nueva venta                 |
| Registrar inicial, abonos o pagos adelantados            | Cuotas → Registrar pago              |
| Descargar Excel o PDF                                    | Reportes                             |
| Cambiar contraseña o datos públicos                      | Configuración                        |

Las fotografías JPG/PNG/WebP (máximo 4 MB cada una) se almacenan en PostgreSQL. Los importes se calculan en céntimos enteros. Las ventas descuentan stock de forma transaccional; los pagos usan una clave única y se asignan a las cuotas más antiguas. Eliminar un modelo sin ventas borra sus variantes/series en cascada; con ventas registradas, se oculta para conservar el historial financiero. El acceso administrativo utiliza JWT de Supabase Auth en cookies `HttpOnly`; la aplicación comprueba el token con Auth **y** el User ID registrado en Prisma en cada operación. Los tokens de renovación permiten mantener la sesión sin exponerlos a JavaScript.

## Verificación

```bash
bun run db:generate
bun run test
bun run lint
bun run format:check
bun run build
```

Se utiliza Webpack en desarrollo y compilación porque Turbopack necesita permisos de creación de junctions de Windows para el cliente de Prisma. El CSS está dividido por responsabilidad y todos los archivos fuente/migraciones se mantienen bajo 300 líneas después del formateador.

## Despliegue

En Vercel, importa el repositorio y carga las variables de entorno. La guía completa, con límites del plan, migraciones y verificación posterior, está en [DEPLOY.md](./DEPLOY.md).

## Licencia

Software propietario. **Todos los derechos reservados.** No se concede permiso para copiar, distribuir, publicar, sublicenciar ni crear obras derivadas. Consulta [LICENSE.md](./LICENSE.md) para los términos completos.

El repositorio debe permanecer **privado**: la licencia restringe el uso legalmente, pero no impide técnicamente que alguien clone el código si es público.
