"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
  /** Clave única: variante + personalización. */
  clave: string;
  productoId: string;
  varianteId: string;
  slug: string;
  nombre: string;
  variante: string;
  imagen: string | null;
  precio: number;
  cantidad: number;
  stock: number;
  personalizacion?: string;
}

interface EstadoCarrito {
  items: ItemCarrito[];
  abierto: boolean;
  agregar: (item: Omit<ItemCarrito, "clave">) => void;
  quitar: (clave: string) => void;
  cambiarCantidad: (clave: string, cantidad: number) => void;
  vaciar: () => void;
  abrir: () => void;
  cerrar: () => void;
}

export const useCarrito = create<EstadoCarrito>()(
  persist(
    (set) => ({
      items: [],
      abierto: false,
      agregar: (item) =>
        set((estado) => {
          const clave = `${item.varianteId}::${item.personalizacion ?? ""}`;
          const existente = estado.items.find((i) => i.clave === clave);
          if (existente) {
            return {
              items: estado.items.map((i) =>
                i.clave === clave
                  ? { ...i, cantidad: Math.min(i.cantidad + item.cantidad, i.stock) }
                  : i,
              ),
              abierto: true,
            };
          }
          return { items: [...estado.items, { ...item, clave }], abierto: true };
        }),
      quitar: (clave) => set((e) => ({ items: e.items.filter((i) => i.clave !== clave) })),
      cambiarCantidad: (clave, cantidad) =>
        set((e) => ({
          items: e.items
            .map((i) =>
              i.clave === clave ? { ...i, cantidad: Math.max(0, Math.min(cantidad, i.stock)) } : i,
            )
            .filter((i) => i.cantidad > 0),
        })),
      vaciar: () => set({ items: [] }),
      abrir: () => set({ abierto: true }),
      cerrar: () => set({ abierto: false }),
    }),
    {
      name: "prosuit-carrito",
      partialize: (e) => ({ items: e.items }),
    },
  ),
);

/**
 * true solo en el cliente, después de hidratar. El carrito vive en localStorage,
 * así que en el servidor (y en el primer render) se muestra vacío para no
 * desincronizar el HTML.
 */
export function useCarritoHidratado() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function subtotalCarrito(items: ItemCarrito[]) {
  return items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
}

export function cantidadCarrito(items: ItemCarrito[]) {
  return items.reduce((acc, i) => acc + i.cantidad, 0);
}
