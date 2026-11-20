"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import { navegacion, navegacionSecundaria, sitio } from "@/lib/sitio";
import { cantidadCarrito, useCarrito, useCarritoHidratado } from "@/lib/carrito";
import { IconoFacebook, IconoInstagram, IconoX } from "@/components/ui/IconosRedes";
import { crearClienteNavegador } from "@/lib/supabase/navegador";

/**
 * Sesión leída en el navegador: `getSession()` lee la cookie local (sin ir a la
 * red), y solo si hay sesión se consulta el rol. Así el servidor no tiene que
 * esperar a Supabase para entregar cada página pública.
 */
function useSesionEncabezado() {
  const [estado, setEstado] = useState({ sesionIniciada: false, esAdmin: false });

  useEffect(() => {
    const supabase = crearClienteNavegador();
    let vigente = true;

    async function resolver(idUsuario: string | undefined) {
      if (!idUsuario) {
        if (vigente) setEstado({ sesionIniciada: false, esAdmin: false });
        return;
      }
      const { data } = await supabase.from("perfiles").select("rol").eq("id", idUsuario).maybeSingle();
      if (vigente) setEstado({ sesionIniciada: true, esAdmin: data?.rol === "admin" });
    }

    supabase.auth.getSession().then(({ data }) => resolver(data.session?.user.id));
    const { data: sub } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if (evento === "SIGNED_IN" || evento === "SIGNED_OUT") resolver(sesion?.user.id);
    });
    return () => {
      vigente = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return estado;
}

/** Cabecera fiel al sitio original: logo, barra negra centrada con "+" y redes a la derecha. */
export default function Encabezado() {
  const { sesionIniciada, esAdmin } = useSesionEncabezado();
  const ruta = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [masAbierto, setMasAbierto] = useState(false);
  const items = useCarrito((e) => e.items);
  const abrirCarrito = useCarrito((e) => e.abrir);
  const hidratado = useCarritoHidratado();

  // Cierra los menús al navegar.
  const [rutaPrevia, setRutaPrevia] = useState(ruta);
  if (ruta !== rutaPrevia) {
    setRutaPrevia(ruta);
    setMenuAbierto(false);
    setMasAbierto(false);
  }

  const cantidad = hidratado ? cantidadCarrito(items) : 0;
  const cuentaHref = esAdmin ? "/admin" : sesionIniciada ? "/mi-cuenta" : "/login";

  const redes = (
    <>
      <a href={sitio.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-primary"><IconoInstagram className="size-5" /></a>
      <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-primary"><IconoFacebook className="size-5" /></a>
      <a href="https://x.com/" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-primary"><IconoX className="size-5" /></a>
    </>
  );

  return (
    <header className="bg-white">
      <div className="contenedor flex items-center justify-between gap-4 py-6 lg:py-8">
        <Link href="/" aria-label="Ir al inicio" className="shrink-0">
          <Image src="/img/logo.webp" alt={sitio.nombre} width={150} height={150} priority className="size-24 lg:size-[150px]" />
        </Link>

        <nav className="hidden items-center bg-black text-white lg:flex" aria-label="Principal">
          {navegacion.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`px-8 py-3 text-base font-medium transition hover:bg-white/10 ${ruta === n.href ? "bg-white/10" : ""}`}
            >
              {n.etiqueta}
            </Link>
          ))}
          <div className="relative">
            <button
              type="button"
              className="px-8 py-3 text-base font-medium hover:bg-white/10"
              aria-haspopup="true"
              aria-expanded={masAbierto}
              aria-label="Más páginas"
              onClick={() => setMasAbierto((v) => !v)}
              onBlur={() => setTimeout(() => setMasAbierto(false), 150)}
            >
              +
            </button>
            {masAbierto && (
              <ul className="absolute right-0 top-full z-40 min-w-44 bg-black py-1 shadow-lg">
                {navegacionSecundaria.map((n) => (
                  <li key={n.href}>
                    <Link href={n.href} className="block px-5 py-2.5 text-sm hover:bg-white/10">{n.etiqueta}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2 lg:gap-3">
          <Link href={cuentaHref} className="p-2 text-foreground hover:text-primary" aria-label={sesionIniciada ? "Mi cuenta" : "Iniciar sesión"}>
            <User className="size-5" strokeWidth={1.75} />
          </Link>
          <button type="button" className="relative p-2 text-foreground hover:text-primary" aria-label="Abrir carrito" onClick={abrirCarrito}>
            <ShoppingBag className="size-5" strokeWidth={1.75} />
            {cantidad > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">{cantidad}</span>
            )}
          </button>
          <div className="ml-4 hidden items-center gap-4 lg:ml-10 lg:flex">{redes}</div>
          <button type="button" className="p-2 lg:hidden" aria-label="Abrir menú" onClick={() => setMenuAbierto(true)}>
            <Menu className="size-6" />
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {menuAbierto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Cerrar menú" onClick={() => setMenuAbierto(false)} />
          <div className="absolute inset-y-0 right-0 flex w-80 max-w-[85vw] flex-col bg-black text-white shadow-xl aparecer">
            <div className="flex items-center justify-between px-5 py-4">
              <span className="font-display text-lg">{sitio.nombre}</span>
              <button type="button" className="p-2" aria-label="Cerrar" onClick={() => setMenuAbierto(false)}><X className="size-5" /></button>
            </div>
            <nav className="flex flex-col" aria-label="Principal móvil">
              {[...navegacion, ...navegacionSecundaria].map((n) => (
                <Link key={n.href} href={n.href} className="px-5 py-3 text-base font-medium hover:bg-white/10">{n.etiqueta}</Link>
              ))}
            </nav>
            <div className="mt-auto flex gap-5 px-5 py-5">{redes}</div>
          </div>
        </div>
      )}
    </header>
  );
}
