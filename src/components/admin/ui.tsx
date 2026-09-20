import Link from "next/link";
import type { ReactNode } from "react";
import { ESTADOS_PEDIDO, type EstadoPedido } from "@/lib/tipos";

/** Piezas de interfaz compartidas por las pantallas del panel. */

export function EncabezadoPagina({
  titulo,
  descripcion,
  acciones,
  volver,
}: {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
  volver?: { href: string; etiqueta: string };
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {volver && (
          <Link href={volver.href} className="text-xs font-medium text-muted hover:text-primary">← {volver.etiqueta}</Link>
        )}
        <h1 className="font-display text-2xl font-bold lg:text-3xl">{titulo}</h1>
        {descripcion && <p className="mt-1 text-sm text-muted">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap gap-2">{acciones}</div>}
    </div>
  );
}

export function ChipEstado({ estado }: { estado: EstadoPedido }) {
  const e = ESTADOS_PEDIDO[estado];
  return <span className={`chip ${e.clase}`}>{e.etiqueta}</span>;
}

export function ChipBooleano({ valor, si = "Activo", no = "Inactivo" }: { valor: boolean; si?: string; no?: string }) {
  return <span className={`chip ${valor ? "bg-emerald-50 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>{valor ? si : no}</span>;
}

export function Tabla({ children }: { children: ReactNode }) {
  return (
    <div className="tabla-scroll overflow-x-auto rounded-xl border border-border bg-white">
      <table className="w-full min-w-[640px] text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <th className={`bg-sand/50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted ${className}`}>{children}</th>;
}

export function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`border-t border-border px-4 py-3 align-middle ${className}`}>{children}</td>;
}

export function Vacio({ titulo, texto, accion }: { titulo: string; texto?: string; accion?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
      <p className="font-semibold">{titulo}</p>
      {texto && <p className="mt-1 text-sm text-muted">{texto}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}

export function Kpi({ etiqueta, valor, detalle, icono }: { etiqueta: string; valor: string; detalle?: string; icono?: ReactNode }) {
  return (
    <div className="tarjeta flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">{etiqueta}</p>
        <p className="mt-2 font-display text-2xl font-bold">{valor}</p>
        {detalle && <p className="mt-1 text-xs text-muted">{detalle}</p>}
      </div>
      {icono && <div className="rounded-lg bg-primary-soft p-2 text-primary">{icono}</div>}
    </div>
  );
}

export function Paginacion({ pagina, total, porPagina, construirUrl }: { pagina: number; total: number; porPagina: number; construirUrl: (p: number) => string }) {
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  if (paginas <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-sm text-muted">
      <p>Página {pagina} de {paginas} · {total} registros</p>
      <div className="flex gap-2">
        {pagina > 1 && <Link href={construirUrl(pagina - 1)} className="btn-secundario px-3 py-1.5">Anterior</Link>}
        {pagina < paginas && <Link href={construirUrl(pagina + 1)} className="btn-secundario px-3 py-1.5">Siguiente</Link>}
      </div>
    </div>
  );
}

export function Aviso({ tipo, texto }: { tipo: "ok" | "error"; texto: string }) {
  return (
    <p className={`mb-4 rounded-lg p-3 text-sm ${tipo === "ok" ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-danger"}`}>{texto}</p>
  );
}
