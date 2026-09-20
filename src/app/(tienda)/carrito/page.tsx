import type { Metadata } from "next";
import VistaCarrito from "@/components/tienda/VistaCarrito";

export const metadata: Metadata = { title: "Carrito", robots: { index: false } };

export default function PaginaCarrito() {
  return (
    <div className="contenedor py-10">
      <h1 className="font-display text-3xl font-bold">Tu carrito</h1>
      <div className="mt-8">
        <VistaCarrito />
      </div>
    </div>
  );
}
