/** Utilidades de formato y texto. */

const clp = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export function formatearCLP(monto: number | null | undefined) {
  return clp.format(monto ?? 0);
}

export function formatearFecha(valor: string | Date, opciones?: Intl.DateTimeFormatOptions) {
  const fecha = typeof valor === "string" ? new Date(valor) : valor;
  return fecha.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...opciones,
  });
}

export function formatearFechaHora(valor: string | Date) {
  const fecha = typeof valor === "string" ? new Date(valor) : valor;
  return fecha.toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function slugificar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function numeroPedido(numero: number) {
  return `#PS-${numero}`;
}

/** Nombre legible de una variante: "M · Azul", "L" o "Única". */
export function nombreVariante(v: { talla: string | null; color: string | null }) {
  const partes = [v.talla, v.color].filter(Boolean);
  return partes.length ? partes.join(" · ") : "Única";
}

export function porcentajeDescuento(precio: number, oferta: number | null) {
  if (!oferta || oferta >= precio) return 0;
  return Math.round(((precio - oferta) / precio) * 100);
}

export function precioVigente(p: { precio: number; precio_oferta: number | null }) {
  return p.precio_oferta && p.precio_oferta < p.precio ? p.precio_oferta : p.precio;
}
