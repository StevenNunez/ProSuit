"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Tags,
  Ticket,
  Truck,
  Users,
  X,
} from "lucide-react";
import { cerrarSesion } from "@/lib/acciones/auth";
import InteractiveLogo from "@/components/InteractiveLogo";

const secciones = [
  {
    titulo: "General",
    enlaces: [
      { href: "/admin", etiqueta: "Escritorio", icono: LayoutDashboard, exacto: true },
      { href: "/admin/pedidos", etiqueta: "Pedidos", icono: ShoppingCart, contador: "pedidos" as const },
      { href: "/admin/clientes", etiqueta: "Clientes", icono: Users },
      { href: "/admin/mensajes", etiqueta: "Mensajes", icono: Mail, contador: "mensajes" as const },
    ],
  },
  {
    titulo: "Catálogo",
    enlaces: [
      { href: "/admin/productos", etiqueta: "Productos", icono: Package },
      { href: "/admin/categorias", etiqueta: "Categorías", icono: Tags },
      { href: "/admin/cupones", etiqueta: "Cupones", icono: Ticket },
    ],
  },
  {
    titulo: "Configuración",
    enlaces: [
      { href: "/admin/envios", etiqueta: "Envíos", icono: Truck },
      { href: "/admin/informes", etiqueta: "Informes", icono: BarChart3 },
      { href: "/admin/ajustes", etiqueta: "Ajustes", icono: Settings },
    ],
  },
];

interface Props {
  nombre: string;
  contadores: { pedidos: number; mensajes: number };
}

export default function BarraLateral({ nombre, contadores }: Props) {
  const ruta = usePathname();
  const [abierta, setAbierta] = useState(false);
  // Cierra el menú móvil al navegar.
  const [rutaPrevia, setRutaPrevia] = useState(ruta);
  if (ruta !== rutaPrevia) {
    setRutaPrevia(ruta);
    setAbierta(false);
  }

  const contenido = (
    <>
      <div className="flex items-center gap-3 px-5 py-5">
        <Image src="/img/logo.webp" alt="ProSuit" width={40} height={40} className="size-10 rounded-lg bg-white p-0.5" />
        <div className="min-w-0">
          <p className="font-display text-base font-semibold leading-tight text-white">ProSuit</p>
          <p className="truncate text-xs text-white/60">Panel de administración</p>
        </div>
        <button type="button" className="ml-auto rounded-lg p-1.5 text-white/70 hover:bg-white/10 lg:hidden" aria-label="Cerrar menú" onClick={() => setAbierta(false)}>
          <X className="size-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6" aria-label="Panel">
        {secciones.map((s) => (
          <div key={s.titulo}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">{s.titulo}</p>
            <ul className="space-y-0.5">
              {s.enlaces.map((e) => {
                const activo = e.exacto ? ruta === e.href : ruta.startsWith(e.href);
                const n = e.contador ? contadores[e.contador] : 0;
                return (
                  <li key={e.href}>
                    <Link
                      href={e.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        activo ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <e.icono className="size-4.5" />
                      <span className="flex-1">{e.etiqueta}</span>
                      {n > 0 && (
                        <span className="rounded-full bg-accent px-1.5 py-0.5 text-[11px] font-bold leading-none text-primary">{n}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-xs text-white/60">Hola, {nombre}</p>
        <div className="mt-2 flex gap-2">
          <Link href="/" target="_blank" className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/10 px-2 py-2 text-xs font-medium text-white hover:bg-white/20">
            <ExternalLink className="size-3.5" /> Ver tienda
          </Link>
          <form action={cerrarSesion} className="flex-1">
            <button type="submit" className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/10 px-2 py-2 text-xs font-medium text-white hover:bg-white/20">
              <LogOut className="size-3.5" /> Salir
            </button>
          </form>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1 text-[11px] text-white/50">
          Desarrollado por{" "}
          <a href="https://www.teolabs.app" target="_blank" rel="noopener noreferrer" className="inline-flex">
            <InteractiveLogo variant="footer-small" className="text-[12px]" />
          </a>{" "}
          ®
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Barra superior móvil */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-white px-4 lg:hidden">
        <button type="button" className="btn-fantasma -ml-2 p-2" aria-label="Abrir menú" onClick={() => setAbierta(true)}>
          <Menu className="size-5" />
        </button>
        <span className="font-display font-semibold">Panel ProSuit</span>
      </div>

      {abierta && <button type="button" className="fixed inset-0 z-40 bg-black/40 lg:hidden" aria-label="Cerrar" onClick={() => setAbierta(false)} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-primary transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:translate-x-0 ${
          abierta ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {contenido}
      </aside>
    </>
  );
}
