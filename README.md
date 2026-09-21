<div align="center">

# PROSUIT

**Uniformes clínicos, escolares y corporativos a medida, desde La Serena para todo Chile**

Tienda online y panel de administración de ProSuit, taller de confección y bordado.

Un producto de **[Teo Labs](https://www.teolabs.app)** ®

</div>

---

## De qué se trata

ProSuit confecciona uniformes en La Serena: ambos y batas clínicas, uniformes escolares
con insignia bordada, ropa corporativa e industrial, prendas deportivas para equipos y
colegios, y accesorios con logo. Durante años vendió con un WordPress + WooCommerce que
nunca tuvo el catálogo cargado: la gente llegaba, no encontraba precios ni tallas y
terminaba escribiendo por WhatsApp para preguntar lo mismo una y otra vez.

**ProSuit (el sitio) reemplaza eso con una tienda propia**, construida a medida del
negocio: catálogo real con tallas, colores y stock; carrito; checkout con pago en línea
por **Mercado Pago** o **transferencia bancaria**; cupones; zonas de envío con tarifa por
región o retiro en el taller; seguimiento de pedido para el cliente; y un panel para que
el dueño administre todo sin tocar código.

No es una plantilla de e-commerce con el logo cambiado. Está pensado para cómo vende un
taller de uniformes en Chile: precios en pesos sin decimales, campo de personalización
(bordado / logo) en cada prenda, aviso de "¿necesitas más de 10 unidades o tallas
especiales?" que deriva a cotización por WhatsApp, y transferencia como método de pago
de primera clase, porque muchos colegios y empresas siguen pagando así.

---

## Lo que hace la tienda

**Catálogo**
- Categorías (Salud, Educación, Corporativo, Industrial, Deportivo, Hostelería,
  Accesorios) con página propia y buscador por texto.
- Cada producto tiene galería de fotos, precio y precio de oferta, descripción, variantes
  por **talla y color** con stock independiente y recargo opcional, productos
  relacionados y datos estructurados `schema.org/Product` para Google Shopping.
- Campo de **personalización** por prenda (texto a bordar, logo, nombre) que viaja hasta
  el pedido.

**Carrito y checkout**
- Carrito persistente en el navegador (sobrevive a cerrar la pestaña), con panel lateral
  y control de cantidad contra el stock real.
- Compra **con o sin cuenta**. El invitado recibe un enlace privado con token para ver
  su pedido; el cliente registrado lo ve en *Mi cuenta*.
- Resumen en vivo: subtotal, descuento por cupón, costo de envío según la región y
  total. Todo se recalcula en el servidor antes de crear el pedido, nunca se confía en
  el precio que manda el navegador.
- Entrega por **envío a domicilio** (zonas configurables: La Serena/Coquimbo y resto de
  Chile, con envío gratis desde cierto monto) o **retiro en el taller**.
- Pago con **Mercado Pago Checkout Pro** (tarjetas, débito, cuotas) o **transferencia**
  con los datos bancarios en la página del pedido y validación manual.

**Después de comprar**
- Página del pedido con estado, detalle, dirección, datos de transferencia si aplica y
  botón de **reintentar pago** si Mercado Pago falló o el cliente cerró la ventana.
- **Seguimiento sin cuenta** por número de pedido + correo (`/seguimiento`).
- Estados del pedido: pendiente de pago → pagado → en preparación → enviado →
  entregado (o cancelado / reembolsado).

**Cuenta del cliente**
- Registro, login, recuperación y cambio de contraseña con Supabase Auth.
- Historial de pedidos y edición de perfil.

**Contenido y contacto**
- Páginas de servicios, galería de trabajos, equipo, testimonios, FAQ y recursos,
  migradas del sitio original.
- Formulario de contacto que cae en la bandeja del panel, y botón de WhatsApp directo.
- SEO listo: metadata por página, Open Graph generado, `sitemap.xml`, `robots.txt`,
  `manifest` y palabras clave del rubro ("uniformes La Serena", "ambos clínicos", etc.).

---

## Lo que hace el panel (`/admin`)

Solo entra quien tiene `rol = 'admin'`. Todo lo demás lo bloquea Postgres por RLS,
aunque alguien conozca la URL.

| Módulo | Qué permite |
|---|---|
| **Escritorio** | Ventas de los últimos 30 días, alertas de stock bajo y últimos pedidos. |
| **Pedidos** | Lista filtrable por estado; detalle con items, personalizaciones, dirección, pago (`mp_payment_id`, estado MP) y notas internas. Cambio de estado manual. |
| **Productos** | Alta, edición, activar/desactivar, destacar; subida de imágenes a Supabase Storage; variantes talla/color con stock y SKU. |
| **Categorías** | Nombre, slug, descripción, imagen y orden en portada. |
| **Cupones** | Porcentaje o monto fijo, mínimo de compra, usos máximos, vencimiento. |
| **Envíos** | Zonas por región con costo, envío gratis desde X y días estimados. |
| **Clientes** | Lista de cuentas; *Hacer admin* para dar acceso al panel. |
| **Mensajes** | Bandeja del formulario de contacto: leído / no leído, eliminar. |
| **Informes** | Ventas por día, productos más vendidos, medios de pago y tipos de entrega. |
| **Ajustes** | Datos de la tienda (teléfono, WhatsApp, dirección, horario, Instagram), datos de transferencia, retiro en tienda, y estado de Mercado Pago. |

---

## El recorrido de una compra

La forma más rápida de entender el código es seguir un pedido de punta a punta.
Una clínica pide 6 ambos con el logo bordado:

```
  Producto        ──►  elige talla y color (variante con stock propio), escribe
                       "bordar logo pecho izquierdo" y agrega al carrito.
        │
  Checkout        ──►  calcularResumen() vuelve a valorizar cada línea desde la
                       base de datos, aplica el cupón si es válido y calcula el
                       envío según la región de la dirección.
        │
  Reserva stock   ──►  descontar_stock() es una función SQL atómica por variante.
                       Si una prenda se agotó entre el carrito y el pago, se
                       repone lo ya descontado y se avisa al cliente.
        │
  Pedido          ──►  se inserta en `pedidos` con número correlativo (PS-1001…),
                       token de acceso para invitados y estado pendiente_pago.
                       Los items se copian con nombre, precio y personalización
                       para que un cambio futuro del catálogo no altere el histórico.
        │
  Pago            ──►  Mercado Pago: se crea la preferencia con external_reference
                       = id del pedido y se redirige al Checkout Pro.
                       Transferencia: se muestran los datos bancarios y queda en
                       manos del admin confirmar.
        │
  Webhook         ──►  /api/mercadopago/webhook valida la firma HMAC, consulta el
                       pago a la API de MP y pasa el pedido a pagado / reembolsado.
                       Nunca retrocede un pedido que ya está en preparación o enviado.
        │
  Panel           ──►  el admin lo ve en Pedidos, lee la personalización, lo pasa a
                       "en preparación" y luego a "enviado". El cliente ve cada
                       cambio en su página de pedido.
```

---

## Las decisiones que sostienen el sistema

**1. La seguridad vive en Postgres, no en la aplicación.** Cada tabla tiene políticas
RLS: el catálogo activo es público, los pedidos solo los ve su dueño o un admin, y
escribir en productos, cupones, zonas o ajustes exige `es_admin()`. Las Server Actions
usan la clave de servicio únicamente para crear pedidos y procesar el webhook.

**2. El precio siempre lo decide el servidor.** El carrito del navegador es una
conveniencia; al pagar se recalcula todo desde la base de datos. Un cliente no puede
manipular precios, cupones ni costos de envío desde las herramientas del navegador.

**3. El stock se reserva al crear el pedido, no al pagar.** Evita vender dos veces la
última unidad. Un pedido cancelado por el admin devuelve el stock.

**4. El historial no depende del catálogo.** `pedido_items` guarda una copia del nombre,
variante, imagen y precio al momento de la compra. Si mañana el producto cambia de
precio o se borra, el pedido de hace tres meses sigue siendo fiel.

**5. Sin Mercado Pago la tienda igual vende.** Si `MP_ACCESS_TOKEN` está vacío, el
checkout ofrece solo transferencia. Así el sitio pudo salir a producción antes de tener
las credenciales de pago aprobadas.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router, Server Components y Server Actions), React 19, Tailwind CSS 4, Lucide icons |
| Carrito | Zustand con persistencia en `localStorage` |
| Base de datos | PostgreSQL en Supabase, RLS en todas las tablas, funciones SQL para stock y cupones |
| Auth | Supabase Auth (email + contraseña, recuperación por enlace) |
| Imágenes | Supabase Storage, bucket público `productos` con escritura solo admin |
| Pagos | Mercado Pago Checkout Pro (SDK oficial) + webhook firmado |
| SEO | Metadata API de Next, `opengraph-image`, `sitemap`, `robots`, JSON-LD de producto |
| Deploy | Vercel, dominio `prosuit.cl` |

---

## Puesta en marcha

```bash
git clone https://github.com/StevenNunez/ProSuit.git
cd ProSuit
npm install

cp .env.example .env.local   # Supabase, URL del sitio, Mercado Pago y credenciales de siembra
```

**1. Base de datos.** En Supabase → SQL Editor, ejecuta
[`supabase/migraciones/0001_tienda.sql`](supabase/migraciones/0001_tienda.sql) entero.
Es idempotente: crea tablas, políticas RLS, funciones, el bucket `productos`, los
ajustes iniciales y las dos zonas de envío por defecto.

**2. Datos de demostración.** Crea el admin, un cliente demo con pedidos de ejemplo y
el catálogo completo (7 categorías, ~20 productos con variantes, cupones):

```bash
npm run sembrar
```

Lee `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DEMO_EMAIL` y `DEMO_PASSWORD` de `.env.local`.
Se puede volver a correr sin duplicar nada.

**3. Arrancar.**

```bash
npm run dev        # http://localhost:3000
npm run build      # build de producción
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

**4. Mercado Pago (opcional para desarrollar).** En
[Tus integraciones](https://www.mercadopago.cl/developers/panel/app) crea una aplicación
Checkout Pro, copia el *Access Token* a `MP_ACCESS_TOKEN` y registra el webhook
`https://<dominio>/api/mercadopago/webhook` con el evento *Pagos*; la clave secreta del
webhook va en `MP_WEBHOOK_SECRET`. Con `MP_SANDBOX=true` se usan credenciales de prueba.

---

## Estructura

```
src/
├── app/
│   ├── (tienda)/            sitio público: portada, tienda, producto, carrito,
│   │                        checkout, pedido, seguimiento, cuenta y páginas de contenido
│   ├── admin/               panel: escritorio, pedidos, productos, categorías, cupones,
│   │                        envíos, clientes, mensajes, informes, ajustes
│   ├── api/mercadopago/     webhook de pagos
│   ├── auth/callback/       intercambio de código de Supabase Auth
│   └── sitemap.ts, robots.ts, opengraph-image.tsx, manifest.ts
├── components/
│   ├── tienda/              cabecera, pie, carrito lateral, galería, tarjetas, checkout
│   ├── admin/               barra lateral y formularios del panel
│   └── InteractiveLogo.tsx  firma de Teo Labs
└── lib/
    ├── acciones/            Server Actions: checkout, auth, admin, contacto
    ├── datos/               consultas de catálogo y ajustes
    ├── supabase/            clientes servidor / navegador / admin y sesión
    ├── mercadopago.ts       preferencia, consulta de pago y firma del webhook
    ├── carrito.ts           store de Zustand
    ├── seo.ts · sitio.ts    palabras clave, datos de contacto, enlace de WhatsApp
    └── contenido.ts         textos editoriales migrados del sitio original

supabase/migraciones/        esquema SQL
scripts/                     siembra de datos demo
```

---

## Roles

- **Cliente**: compra con o sin cuenta. Con cuenta ve su historial en `/mi-cuenta`.
- **Admin** (`perfiles.rol = 'admin'`): acceso a `/admin`. Se asigna desde
  *Clientes → Hacer admin* o con el script de siembra.

---

## Deploy en Vercel

Importar el repo, definir las variables de `.env.example` (sin las de siembra) y
desplegar. Después del primer deploy:

- Configurar el dominio `prosuit.cl` y actualizar `NEXT_PUBLIC_SITE_URL`.
- Registrar la URL del webhook en Mercado Pago.
- En Supabase Auth, poner la *Site URL* y agregar `https://prosuit.cl/auth/callback`
  a las *Redirect URLs*.

---

## Seguridad

- `.env.local` **nunca** se sube al repositorio; las variables van en el dashboard de
  Vercel. `.env.example` solo trae los nombres.
- `SUPABASE_SERVICE_ROLE_KEY` se usa solo en Server Actions y en el webhook. Es la única
  llave que salta la RLS y jamás llega al cliente.
- El webhook de Mercado Pago verifica la firma `x-signature` antes de tocar un pedido y
  responde siempre 200 para que MP no reintente en bucle; un pago que no se pudo
  procesar se reconcilia desde el panel.
- Los enlaces de pedido para invitados llevan un token aleatorio de 128 bits; sin él no
  se puede ver un pedido ajeno aunque se adivine el id.

---

<div align="center">

### Construido por Teo Labs

Diseño, arquitectura e ingeniería de **[Teo Labs](https://www.teolabs.app)** ®

*Hacemos software que vende.*

</div>
