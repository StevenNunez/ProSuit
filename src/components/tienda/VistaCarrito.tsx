"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { subtotalCarrito, useCarrito, useCarritoHidratado } from "@/lib/carrito";
import { formatearCLP } from "@/lib/formato";

export default function VistaCarrito() {
  const { items, quitar, cambiarCantidad, vaciar } = useCarrito();
  const hidratado = useCarritoHidratado();
  if (!hidratado) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-14 text-center">
        <ShoppingBag className="size-10 text-muted/50" />
        <p className="font-semibold">Tu carrito está vacío.</p>
        <p className="text-sm text-muted">Explora la tienda y agrega los uniformes que necesitas.</p>
        <Link href="/tienda" className="btn-primario mt-2">Ir a la tienda</Link>
      </div>
    );
  }

  const subtotal = subtotalCarrito(items);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="hidden bg-sand/60 text-left text-xs uppercase tracking-wide text-muted sm:table-header-group">
            <tr>
              <th className="px-5 py-3">Producto</th>
              <th className="px-5 py-3">Cantidad</th>
              <th className="px-5 py-3 text-right">Total</th>
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((i) => (
              <tr key={i.clave} className="align-middle">
                <td className="px-5 py-4">
                  <div className="flex gap-4">
                    <Link href={`/producto/${i.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-sand">
                      {i.imagen && <Image src={i.imagen} alt={i.nombre} fill sizes="80px" className="object-cover" />}
                    </Link>
                    <div>
                      <Link href={`/producto/${i.slug}`} className="font-medium hover:text-primary">{i.nombre}</Link>
                      <p className="text-xs text-muted">{i.variante}</p>
                      {i.personalizacion && <p className="text-xs text-muted">Personalización: {i.personalizacion}</p>}
                      <p className="mt-1 text-xs text-muted">{formatearCLP(i.precio)} c/u</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="inline-flex items-center rounded-lg border border-border">
                    <button type="button" className="px-2.5 py-1.5 hover:bg-sand" aria-label="Restar" onClick={() => cambiarCantidad(i.clave, i.cantidad - 1)}><Minus className="size-3.5" /></button>
                    <span className="w-8 text-center font-medium">{i.cantidad}</span>
                    <button type="button" className="px-2.5 py-1.5 hover:bg-sand disabled:opacity-40" aria-label="Sumar" disabled={i.cantidad >= i.stock} onClick={() => cambiarCantidad(i.clave, i.cantidad + 1)}><Plus className="size-3.5" /></button>
                  </div>
                </td>
                <td className="px-5 py-4 text-right font-semibold">{formatearCLP(i.precio * i.cantidad)}</td>
                <td className="px-3 py-4">
                  <button type="button" className="text-muted hover:text-danger" aria-label="Quitar" onClick={() => quitar(i.clave)}><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between border-t border-border px-5 py-3 text-sm">
          <Link href="/tienda" className="text-primary hover:underline">← Seguir comprando</Link>
          <button type="button" className="text-muted hover:text-danger" onClick={vaciar}>Vaciar carrito</button>
        </div>
      </div>

      <aside className="tarjeta h-fit lg:sticky lg:top-28">
        <h2 className="font-display text-lg font-semibold">Resumen</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-semibold">{formatearCLP(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Envío</dt><dd className="text-muted">Se calcula al pagar</dd></div>
        </dl>
        <Link href="/checkout" className="btn-primario mt-5 w-full py-3.5 text-base">Finalizar compra</Link>
        <p className="mt-3 text-center text-xs text-muted">Mercado Pago o transferencia bancaria.</p>
      </aside>
    </div>
  );
}
