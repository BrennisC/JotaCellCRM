# Despliegue en Vercel

Guía para publicar JOTACELL en Vercel conectado a Supabase PostgreSQL. El panel
administrativo no requiere configuración adicional: usa las mismas variables.

## 1. Archivos ya preparados

| Archivo                | Función                                                       |
| ---------------------- | ------------------------------------------------------------- |
| `vercel.json`          | Framework, instalación con Bun y comando de build             |
| `package.json`         | `vercel:build` ejecuta `prisma generate` antes de compilar    |
| `prisma/schema.prisma` | `binaryTargets` incluye el runtime Linux de Vercel            |
| `next.config.ts`       | Cabeceras de seguridad (anti-clickjacking, nosniff, referrer) |
| `.gitignore`           | Excluye `.env*` y conserva solo `.env.example`                |

## 2. Variables de entorno

Se configuran en Vercel → Project → Settings → Environment Variables, para
**Production** y **Preview**. No se suben al repositorio.

| Variable                   | Obligatoria | Origen                                                     |
| -------------------------- | ----------- | ---------------------------------------------------------- |
| `DATABASE_URL`             | Sí          | Supabase → Connect → Transaction pooler, puerto 6543       |
| `DIRECT_URL`               | Sí          | Supabase → Connect → Session pooler, puerto 5432           |
| `SUPABASE_URL`             | Sí          | `https://<ref>.supabase.co`                                |
| `SUPABASE_PUBLISHABLE_KEY` | Sí          | Supabase → Project Settings → API Keys                     |
| `ADMIN_EMAIL`              | Sí          | Correo del usuario creado en Supabase Auth                 |
| `SUPABASE_ADMIN_USER_ID`   | Sí          | User ID (UUID) de ese usuario                              |
| `APP_ORIGIN`               | Opcional    | Dominio público, por ejemplo `https://jotacell.vercel.app` |
| `R2_ACCOUNT_ID`            | Opcional    | Cloudflare → R2 → panel derecho                            |
| `R2_ACCESS_KEY_ID`         | Opcional    | R2 → Manage R2 API Tokens (Object Read & Write)            |
| `R2_SECRET_ACCESS_KEY`     | Opcional    | Se muestra una sola vez al crear el token                  |
| `R2_BUCKET`                | Opcional    | Nombre del bucket, por ejemplo `jota-cell`                 |
| `R2_PUBLIC_URL`            | Opcional    | URL pública del bucket (`https://pub-….r2.dev`)            |

Las cinco variables `R2_*` se cargan juntas o no se cargan. Sin ellas la app
guarda las imágenes en PostgreSQL como respaldo; con ellas las sube a Cloudflare
R2. `R2_PUBLIC_URL` **no** es el endpoint S3 (`…r2.cloudflarestorage.com`), sino
la URL pública del bucket. Verifica la configuración con `bun run r2:check`.

Recomendaciones para la URL de conexión:

- Añade `?pgbouncer=true&connection_limit=1` al final de `DATABASE_URL`. Cada
  función serverless abre su propia conexión; sin ese límite el pool de Supabase
  se agota con pocas visitas simultáneas.
- No uses la conexión directa (puerto 5432) en `DATABASE_URL`: está reservada para
  migraciones.

Sobre `APP_ORIGIN`: si la defines, el login solo acepta peticiones desde ese
dominio exacto. Eso rompe los previews de Vercel, así que déjala **vacía** o
configúrala únicamente en Production.

## 3. Primer despliegue

1. Sube el proyecto a un repositorio **privado** (ver `LICENSE.md`).
2. En Vercel: **Add New → Project → Import** el repositorio.
3. Vercel detecta Next.js y `bun.lock`; no cambies los comandos, los toma de
   `vercel.json`.
4. Carga las variables de entorno del punto 2 antes del primer deploy.
5. Deploy.

## 4. Base de datos y administrador

Las migraciones se ejecutan desde tu máquina, no en cada deploy:

```bash
bun run db:deploy            # aplica migraciones pendientes
bun run db:check-security    # confirma RLS activo en las 12 tablas
bun run admin:setup          # autoriza el usuario de Supabase Auth
```

Ambos comandos usan `.env.local`, que apunta a la misma base de Supabase. No es
necesario ejecutarlos en Vercel.

## 5. Verificación posterior

| Comprobación                          | Resultado esperado                     |
| ------------------------------------- | -------------------------------------- |
| `/` y `/celulares`                    | 200 y catálogo visible                 |
| `/admin` sin sesión                   | Redirige a `/admin/login`              |
| Login con el usuario de Supabase Auth | Entra al panel sin errores             |
| Guardar Configuración                 | 200 y datos persistidos                |
| Subir una imagen                      | Se muestra en la ficha pública         |
| Recargar el panel tras 1 hora         | Renueva la sesión sin pedir contraseña |

## 6. Límites y advertencias

- **Plan de Vercel.** El plan Hobby es solo para uso personal y no comercial. Una
  tienda con ventas reales necesita el plan **Pro**. Revísalo antes de publicar.
- **Tamaño de subida.** Las funciones serverless aceptan hasta 4.5 MB por
  petición; la app corta en **4 MB** por imagen. Vercel rechaza el resto con 413.
- **Imágenes en R2.** Con las variables `R2_*` configuradas, las fotos se guardan
  en Cloudflare R2 (10 GB gratis, sin costo de salida) y en la base solo queda la
  URL. Sin ellas se guardan en PostgreSQL y consumen almacenamiento y ancho de
  banda de Supabase.
- **`r2.dev` no es para producción.** Cloudflare limita ese subdominio y lo marca
  como solo para pruebas. Conecta un dominio propio al bucket (`img.tudominio.pe`)
  antes de publicar la tienda.
- **Sin sistema de archivos persistente.** Todo lo que se guarde en disco se
  pierde; por eso las imágenes viven en R2 o en la base de datos.
- **Región.** Supabase está en `us-west-2`. Si tu plan permite elegir región,
  usa `pdx1` para reducir latencia.
- **Cold starts.** La primera petición tras inactividad tarda más por Prisma; es
  normal.
- **Secretos.** Nunca subas `.env.local`. Si una credencial se filtra, rótala en
  Supabase y actualiza las variables en Vercel.

## 7. Dominio propio

Vercel → Project → Settings → Domains. Al añadir un dominio, actualiza
`APP_ORIGIN` con el dominio final (con `https://`) y vuelve a desplegar.
