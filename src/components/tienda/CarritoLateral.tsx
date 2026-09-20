"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { subtotalCarrito, useCarrito } from "@/lib/carrito";
import { formatearCLP } from "@/lib/formato";

export default function CarritoLateral() {
  const { items, abierto, cerrar, quitar, cambiarCantidad } = useCarrito();

  useEffect(() => {
    if (!abierto) return;
    const alEscape = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    document.addEventListener("keydown", alEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", alEscape);
      document.body.style.overflow = "";
    };
  }, [abierto, cerrar]);

  if (!abierto) return null;
  const subtotal = subtotalCarrito(items);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Carrito de compras">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Cerrar carrito" onClick={cerrar} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl aparecer">
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="size-5 text-primary" /> Tu carrito
          </h2>
          <button type="button" className="btn-fantasma p-2" aria-label="Cerrar" onClick={cerrar}>
            <X className="size-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingBag className="size-10 text-muted/50" />
            <p className="text-muted">Tu carrito está vacío.</p>
            <Link href="/tienda" className="btn-primario" onClick={cerrar}>Ver la tienda</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.clave} className="flex gap-4 py-4">
                  <Link href={`/producto/${item.slug}`} onClick={cerrar} className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-sand">
                    {item.imagen && (
                      <Image src={item.imagen} alt={item.nombre} fill sizes="80px" className="object-cover" />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <div>
                        <Link href={`/producto/${item.slug}`} onClick={cerrar} className="font-medium leading-tight hover:text-primary">
                          {item.nombre}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted">{item.variante}</p>
                        {item.personalizacion && (
                          <p className="mt-0.5 text-xs text-muted">Personalización: {item.personalizacion}</p>
                        )}
                      </div>
                      <button type="button" className="text-muted hover:text-danger" aria-label="Quitar" onClick={() => quitar(item.clave)}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="inline-flex items-center rounded-lg border border-border">
                        <button type="button" className="px-2 py-1 hover:bg-sand" aria-label="Restar" onClick={() => cambiarCantidad(item.clave, item.cantidad - 1)}>
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.cantidad}</span>
                        <button type="button" className="px-2 py-1 hover:bg-sand disabled:opacity-40" aria-label="Sumar" disabled={item.cantidad >= item.stock} onClick={() => cambiarCantidad(item.clave, item.cantidad + 1)}>
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="font-semibold">{formatearCLP(item.precio * item.cantidad)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="border-t border-border p-5">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-semibold">{formatearCLP(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">El envío se calcula en el siguiente paso.</p>
              <div className="mt-4 grid gap-2">
                <Link href="/checkout" className="btn-primario w-full" onClick={cerrar}>Ir a pagar</Link>
                <Link href="/carrito" className="btn-secundario w-full" onClick={cerrar}>Ver carrito</Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
