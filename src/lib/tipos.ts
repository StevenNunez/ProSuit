/** Tipos de las tablas de Supabase (espejo de supabase/migraciones). */

export type Rol = "cliente" | "admin";

export interface Perfil {
  id: string;
  email: string | null;
  nombre: string | null;
  telefono: string | null;
  rol: Rol;
  creado_el: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagen_url: string | null;
  orden: number;
  activa: boolean;
}

export interface Variante {
  id: string;
  producto_id: string;
  talla: string | null;
  color: string | null;
  sku: string | null;
  stock: number;
  precio_extra: number;
  activa: boolean;
  orden: number;
}

export interface Producto {
  id: string;
  nombre: string;
  slug: string;
  sku: string | null;
  descripcion_corta: string | null;
  descripcion: string | null;
  precio: number;
  precio_oferta: number | null;
  categoria_id: string | null;
  imagenes: string[];
  destacado: boolean;
  activo: boolean;
  permite_personalizacion: boolean;
  creado_el: string;
  actualizado_el: string;
}

export interface ProductoConRelaciones extends Producto {
  categoria?: Pick<Categoria, "id" | "nombre" | "slug"> | null;
  variantes?: Variante[];
}

export interface Cupon {
  id: string;
  codigo: string;
  tipo: "porcentaje" | "monto";
  valor: number;
  minimo: number;
  usos_max: number | null;
  usos: number;
  vence_el: string | null;
  activo: boolean;
  creado_el: string;
}

export interface ZonaEnvio {
  id: string;
  nombre: string;
  regiones: string[];
  costo: number;
  gratis_desde: number | null;
  dias_estimados: string | null;
  activa: boolean;
  orden: number;
}

export type EstadoPedido =
  | "pendiente_pago"
  | "pagado"
  | "en_preparacion"
  | "enviado"
  | "entregado"
  | "cancelado"
  | "reembolsado";

export type MetodoPago = "mercadopago" | "transferencia";
export type MetodoEntrega = "envio" | "retiro";

export interface Direccion {
  calle?: string;
  numero?: string;
  depto?: string;
  comuna?: string;
  region?: string;
  notas?: string;
}

export interface Pedido {
  id: string;
  numero: number;
  usuario_id: string | null;
  token_acceso: string;
  email: string;
  nombre: string;
  telefono: string | null;
  rut: string | null;
  direccion: Direccion;
  metodo_entrega: MetodoEntrega;
  zona_envio: string | null;
  subtotal: number;
  descuento: number;
  envio: number;
  total: number;
  cupon_codigo: string | null;
  metodo_pago: MetodoPago;
  estado: EstadoPedido;
  mp_preference_id: string | null;
  mp_payment_id: string | null;
  mp_status: string | null;
  notas_cliente: string | null;
  notas_admin: string | null;
  creado_el: string;
  actualizado_el: string;
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  producto_id: string | null;
  variante_id: string | null;
  nombre: string;
  variante: string | null;
  imagen_url: string | null;
  precio_unitario: number;
  cantidad: number;
  personalizacion: string | null;
}

export interface PedidoConItems extends Pedido {
  items: PedidoItem[];
}

export interface MensajeContacto {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  asunto: string | null;
  mensaje: string;
  leido: boolean;
  creado_el: string;
}

export interface AjustesTienda {
  nombre: string;
  email: string;
  telefono: string;
  whatsapp: string;
  direccion: string;
  instagram: string;
  horario: string;
}

export interface AjustesTransferencia {
  activa: boolean;
  banco: string;
  tipo_cuenta: string;
  numero: string;
  rut: string;
  titular: string;
  email: string;
}

export interface AjustesRetiro {
  activo: boolean;
  direccion: string;
  horario: string;
}

export const ESTADOS_PEDIDO: Record<EstadoPedido, { etiqueta: string; clase: string }> = {
  pendiente_pago: { etiqueta: "Pendiente de pago", clase: "bg-amber-50 text-amber-800" },
  pagado: { etiqueta: "Pagado", clase: "bg-emerald-50 text-emerald-800" },
  en_preparacion: { etiqueta: "En preparación", clase: "bg-sky-50 text-sky-800" },
  enviado: { etiqueta: "Enviado", clase: "bg-indigo-50 text-indigo-800" },
  entregado: { etiqueta: "Entregado", clase: "bg-emerald-100 text-emerald-900" },
  cancelado: { etiqueta: "Cancelado", clase: "bg-rose-50 text-rose-800" },
  reembolsado: { etiqueta: "Reembolsado", clase: "bg-gray-100 text-gray-700" },
};
