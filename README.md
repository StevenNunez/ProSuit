# ProSuit · tienda online

Tienda de uniformes y prendas personalizadas de ProSuit (La Serena, Chile).
Reemplaza el sitio WordPress/WooCommerce anterior con una tienda propia y un
panel de administración.

**Stack:** Next.js 16 (App Router) · Tailwind CSS 4 · Supabase (Postgres, Auth,
Storage) · Mercado Pago Checkout Pro · Vercel.

## Puesta en marcha

1. **Supabase**: crea un proyecto y ejecuta `supabase/migraciones/0001_tienda.sql`
   en el SQL Editor (crea tablas, políticas RLS, el bucket `productos` y los
   ajustes iniciales).
2. **Variables de entorno**: copia `.env.example` a `.env.local` y completa las
   claves de Supabase. `NEXT_PUBLIC_SITE_URL` debe ser la URL pública del sitio.
3. **Dependencias y datos**:

   ```bash
   npm install
   npm run sembrar   # crea el admin, el cliente demo y el catálogo de ejemplo
   npm run dev
   ```

   `npm run sembrar` lee `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DEMO_EMAIL` y
   `DEMO_PASSWORD` de `.env.local`. Es idempotente: se puede volver a correr.

4. **Mercado Pago**: en [Tus integraciones](https://www.mercadopago.cl/developers/panel/app)
   crea una aplicación (Checkout Pro), copia el *Access Token* de producción a
   `MP_ACCESS_TOKEN` y registra el webhook `https://<dominio>/api/mercadopago/webhook`
   (evento *Pagos*); la clave secreta del webhook va en `MP_WEBHOOK_SECRET`.
   Sin token la tienda sigue vendiendo por transferencia bancaria.

## Estructura

| Ruta | Qué es |
| --- | --- |
| `src/app/(tienda)` | Sitio público: portada, tienda, producto, carrito, checkout, pedidos, cuenta y páginas de contenido. |
| `src/app/admin` | Panel: escritorio, pedidos, productos, categorías, cupones, clientes, mensajes, envíos, informes y ajustes. |
| `src/app/api/mercadopago/webhook` | Notificaciones de pago de Mercado Pago. |
| `src/lib/acciones` | Server Actions (checkout, auth, panel, contacto). |
| `src/lib/datos` | Consultas de catálogo y ajustes. |
| `src/lib/contenido.ts` | Textos editoriales migrados del sitio original (FAQ, equipo, recursos…). |
| `supabase/migraciones` | Esquema SQL. |
| `scripts/` | Siembra de datos demo. |

## Roles

- **Cliente**: compra con o sin cuenta; con cuenta ve su historial en `/mi-cuenta`.
- **Admin** (`perfiles.rol = 'admin'`): acceso a `/admin`. Se asigna desde
  *Clientes → Hacer admin* o con el script de siembra.

## Deploy en Vercel

Importar el repo, definir las variables de `.env.example` (sin las de siembra)
y desplegar. Después del primer deploy, configurar el dominio `prosuit.cl` y
actualizar `NEXT_PUBLIC_SITE_URL`, la URL del webhook en Mercado Pago y la
*Site URL* / *Redirect URLs* en Supabase Auth (`https://prosuit.cl/auth/callback`).
