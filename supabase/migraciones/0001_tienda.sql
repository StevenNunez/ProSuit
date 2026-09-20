-- ProSuit · esquema de la tienda
-- Correr en el SQL Editor de Supabase. Es idempotente: se puede volver a correr.

create extension if not exists "pgcrypto";

-- ── Perfiles (uno por usuario de auth) ───────────────────────────────────────
create table if not exists public.perfiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  nombre      text,
  telefono    text,
  rol         text not null default 'cliente' check (rol in ('cliente','admin')),
  creado_el   timestamptz not null default now()
);

create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, email, nombre)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nombre', ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- ¿El usuario autenticado es administrador?
create or replace function public.es_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin');
$$;

-- ── Catálogo ─────────────────────────────────────────────────────────────────
create table if not exists public.categorias (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  slug        text not null unique,
  descripcion text,
  imagen_url  text,
  orden       int  not null default 0,
  activa      boolean not null default true
);

create table if not exists public.productos (
  id                 uuid primary key default gen_random_uuid(),
  nombre             text not null,
  slug               text not null unique,
  sku                text,
  descripcion_corta  text,
  descripcion        text,
  precio             integer not null check (precio >= 0),          -- CLP, sin decimales
  precio_oferta      integer check (precio_oferta is null or precio_oferta >= 0),
  categoria_id       uuid references public.categorias(id) on delete set null,
  imagenes           text[] not null default '{}',
  destacado          boolean not null default false,
  activo             boolean not null default true,
  permite_personalizacion boolean not null default true,             -- bordado / logo
  creado_el          timestamptz not null default now(),
  actualizado_el     timestamptz not null default now()
);
create index if not exists productos_categoria_idx on public.productos(categoria_id);
create index if not exists productos_activo_idx on public.productos(activo);

-- Variantes: talla y/o color. Todo producto tiene al menos una (puede ser "Única").
create table if not exists public.variantes (
  id           uuid primary key default gen_random_uuid(),
  producto_id  uuid not null references public.productos(id) on delete cascade,
  talla        text,
  color        text,
  sku          text,
  stock        integer not null default 0 check (stock >= 0),
  precio_extra integer not null default 0,
  activa       boolean not null default true,
  orden        int not null default 0
);
create index if not exists variantes_producto_idx on public.variantes(producto_id);

-- ── Cupones y envío ──────────────────────────────────────────────────────────
create table if not exists public.cupones (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null unique,
  tipo        text not null check (tipo in ('porcentaje','monto')),
  valor       integer not null check (valor > 0),
  minimo      integer not null default 0,
  usos_max    integer,
  usos        integer not null default 0,
  vence_el    date,
  activo      boolean not null default true,
  creado_el   timestamptz not null default now()
);

create table if not exists public.zonas_envio (
  id           uuid primary key default gen_random_uuid(),
  nombre       text not null,
  regiones     text[] not null default '{}',
  costo        integer not null default 0,
  gratis_desde integer,
  dias_estimados text,
  activa       boolean not null default true,
  orden        int not null default 0
);

-- ── Pedidos ──────────────────────────────────────────────────────────────────
create sequence if not exists public.pedidos_numero_seq start 1001;

create table if not exists public.pedidos (
  id             uuid primary key default gen_random_uuid(),
  numero         integer not null unique default nextval('public.pedidos_numero_seq'),
  usuario_id     uuid references auth.users(id) on delete set null,
  token_acceso   text not null default encode(gen_random_bytes(16), 'hex'), -- para invitados
  email          text not null,
  nombre         text not null,
  telefono       text,
  rut            text,
  direccion      jsonb not null default '{}'::jsonb,   -- {calle, numero, depto, comuna, region, notas}
  metodo_entrega text not null default 'envio' check (metodo_entrega in ('envio','retiro')),
  zona_envio     text,
  subtotal       integer not null default 0,
  descuento      integer not null default 0,
  envio          integer not null default 0,
  total          integer not null default 0,
  cupon_codigo   text,
  metodo_pago    text not null default 'mercadopago' check (metodo_pago in ('mercadopago','transferencia')),
  estado         text not null default 'pendiente_pago'
                 check (estado in ('pendiente_pago','pagado','en_preparacion','enviado','entregado','cancelado','reembolsado')),
  mp_preference_id text,
  mp_payment_id    text,
  mp_status        text,
  notas_cliente  text,
  notas_admin    text,
  creado_el      timestamptz not null default now(),
  actualizado_el timestamptz not null default now()
);
create index if not exists pedidos_usuario_idx on public.pedidos(usuario_id);
create index if not exists pedidos_estado_idx on public.pedidos(estado);
create index if not exists pedidos_creado_idx on public.pedidos(creado_el desc);

create table if not exists public.pedido_items (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid not null references public.pedidos(id) on delete cascade,
  producto_id     uuid references public.productos(id) on delete set null,
  variante_id     uuid references public.variantes(id) on delete set null,
  nombre          text not null,
  variante        text,
  imagen_url      text,
  precio_unitario integer not null,
  cantidad        integer not null check (cantidad > 0),
  personalizacion text
);
create index if not exists pedido_items_pedido_idx on public.pedido_items(pedido_id);

-- ── Contenido y ajustes ──────────────────────────────────────────────────────
create table if not exists public.mensajes_contacto (
  id        uuid primary key default gen_random_uuid(),
  nombre    text not null,
  email     text not null,
  telefono  text,
  asunto    text,
  mensaje   text not null,
  leido     boolean not null default false,
  creado_el timestamptz not null default now()
);

create table if not exists public.ajustes (
  clave   text primary key,
  valor   jsonb not null,
  publico boolean not null default false
);

-- ── Utilidades ───────────────────────────────────────────────────────────────
create or replace function public.tocar_actualizado()
returns trigger language plpgsql as $$
begin new.actualizado_el = now(); return new; end $$;

drop trigger if exists productos_tocar on public.productos;
create trigger productos_tocar before update on public.productos
  for each row execute function public.tocar_actualizado();
drop trigger if exists pedidos_tocar on public.pedidos;
create trigger pedidos_tocar before update on public.pedidos
  for each row execute function public.tocar_actualizado();

-- Descuenta stock de forma atómica; devuelve false si no alcanza.
create or replace function public.descontar_stock(p_variante uuid, p_cantidad int)
returns boolean language plpgsql security definer set search_path = public as $$
declare filas int;
begin
  update public.variantes set stock = stock - p_cantidad
   where id = p_variante and stock >= p_cantidad;
  get diagnostics filas = row_count;
  return filas > 0;
end $$;

create or replace function public.reponer_stock(p_variante uuid, p_cantidad int)
returns void language sql security definer set search_path = public as $$
  update public.variantes set stock = stock + p_cantidad where id = p_variante;
$$;

create or replace function public.usar_cupon(p_codigo text)
returns void language sql security definer set search_path = public as $$
  update public.cupones set usos = usos + 1 where codigo = p_codigo;
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.perfiles          enable row level security;
alter table public.categorias        enable row level security;
alter table public.productos         enable row level security;
alter table public.variantes         enable row level security;
alter table public.cupones           enable row level security;
alter table public.zonas_envio       enable row level security;
alter table public.pedidos           enable row level security;
alter table public.pedido_items      enable row level security;
alter table public.mensajes_contacto enable row level security;
alter table public.ajustes           enable row level security;

-- perfiles
drop policy if exists "perfil propio" on public.perfiles;
create policy "perfil propio" on public.perfiles
  for select using (id = auth.uid() or public.es_admin());
drop policy if exists "editar perfil propio" on public.perfiles;
create policy "editar perfil propio" on public.perfiles
  for update using (id = auth.uid() or public.es_admin());

-- catálogo: lectura pública de lo activo, escritura solo admin
drop policy if exists "categorias publicas" on public.categorias;
create policy "categorias publicas" on public.categorias for select using (activa or public.es_admin());
drop policy if exists "admin categorias" on public.categorias;
create policy "admin categorias" on public.categorias for all using (public.es_admin()) with check (public.es_admin());

drop policy if exists "productos publicos" on public.productos;
create policy "productos publicos" on public.productos for select using (activo or public.es_admin());
drop policy if exists "admin productos" on public.productos;
create policy "admin productos" on public.productos for all using (public.es_admin()) with check (public.es_admin());

drop policy if exists "variantes publicas" on public.variantes;
create policy "variantes publicas" on public.variantes for select using (true);
drop policy if exists "admin variantes" on public.variantes;
create policy "admin variantes" on public.variantes for all using (public.es_admin()) with check (public.es_admin());

drop policy if exists "zonas publicas" on public.zonas_envio;
create policy "zonas publicas" on public.zonas_envio for select using (activa or public.es_admin());
drop policy if exists "admin zonas" on public.zonas_envio;
create policy "admin zonas" on public.zonas_envio for all using (public.es_admin()) with check (public.es_admin());

-- cupones: solo admin los ve; la validación en checkout va por servidor
drop policy if exists "admin cupones" on public.cupones;
create policy "admin cupones" on public.cupones for all using (public.es_admin()) with check (public.es_admin());

-- pedidos: el dueño ve los suyos, el admin todo. Se crean desde el servidor.
drop policy if exists "pedidos propios" on public.pedidos;
create policy "pedidos propios" on public.pedidos for select using (usuario_id = auth.uid() or public.es_admin());
drop policy if exists "admin pedidos" on public.pedidos;
create policy "admin pedidos" on public.pedidos for update using (public.es_admin()) with check (public.es_admin());

drop policy if exists "items propios" on public.pedido_items;
create policy "items propios" on public.pedido_items for select
  using (exists (select 1 from public.pedidos p where p.id = pedido_id and (p.usuario_id = auth.uid() or public.es_admin())));

-- mensajes: cualquiera envía, solo admin lee
drop policy if exists "enviar mensaje" on public.mensajes_contacto;
create policy "enviar mensaje" on public.mensajes_contacto for insert with check (true);
drop policy if exists "admin mensajes" on public.mensajes_contacto;
create policy "admin mensajes" on public.mensajes_contacto for all using (public.es_admin()) with check (public.es_admin());

drop policy if exists "ajustes publicos" on public.ajustes;
create policy "ajustes publicos" on public.ajustes for select using (publico or public.es_admin());
drop policy if exists "admin ajustes" on public.ajustes;
create policy "admin ajustes" on public.ajustes for all using (public.es_admin()) with check (public.es_admin());

-- ── Storage: imágenes de productos ───────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

drop policy if exists "imagenes publicas" on storage.objects;
create policy "imagenes publicas" on storage.objects for select using (bucket_id = 'productos');
drop policy if exists "admin sube imagenes" on storage.objects;
create policy "admin sube imagenes" on storage.objects for insert with check (bucket_id = 'productos' and public.es_admin());
drop policy if exists "admin actualiza imagenes" on storage.objects;
create policy "admin actualiza imagenes" on storage.objects for update using (bucket_id = 'productos' and public.es_admin());
drop policy if exists "admin borra imagenes" on storage.objects;
create policy "admin borra imagenes" on storage.objects for delete using (bucket_id = 'productos' and public.es_admin());

-- ── Ajustes iniciales ────────────────────────────────────────────────────────
insert into public.ajustes (clave, valor, publico) values
  ('tienda', '{"nombre":"ProSuit","email":"contacto@prosuit.cl","telefono":"+56 9 3742 5428","whatsapp":"56937425428","direccion":"Tihue 1813, La Serena, Coquimbo","instagram":"https://www.instagram.com/prosuit.chile","horario":"Lun a Vie 10:00 – 19:00"}'::jsonb, true),
  ('transferencia', '{"activa":true,"banco":"","tipo_cuenta":"","numero":"","rut":"","titular":"ProSuit","email":"contacto@prosuit.cl"}'::jsonb, true),
  ('retiro', '{"activo":true,"direccion":"Tihue 1813, La Serena","horario":"Lun a Vie 10:00 – 19:00"}'::jsonb, true)
on conflict (clave) do nothing;

insert into public.zonas_envio (nombre, regiones, costo, gratis_desde, dias_estimados, orden)
select * from (values
  ('La Serena y Coquimbo', array['Región de Coquimbo'], 3500, 60000, '1 a 3 días hábiles', 1),
  ('Resto de Chile', array['Región de Arica y Parinacota','Región de Tarapacá','Región de Antofagasta','Región de Atacama','Región de Valparaíso','Región Metropolitana de Santiago','Región del Libertador General Bernardo O''Higgins','Región del Maule','Región de Ñuble','Región del Biobío','Región de La Araucanía','Región de Los Ríos','Región de Los Lagos','Región de Aysén','Región de Magallanes y de la Antártica Chilena'], 6500, 100000, '3 a 7 días hábiles', 2)
) as v(nombre, regiones, costo, gratis_desde, dias_estimados, orden)
where not exists (select 1 from public.zonas_envio);

-- Deja la secuencia de números de pedido por encima del mayor existente
-- (la usa el script de siembra, que inserta números fijos).
create or replace function public.reajustar_numero_pedidos()
returns void language sql security definer set search_path = public as $$
  select setval('public.pedidos_numero_seq', greatest((select coalesce(max(numero), 1000) from public.pedidos), 1000) + 1, false);
$$;
