"use client";

import Image from "next/image";
import { useState } from "react";

export default function GaleriaProducto({ imagenes, nombre }: { imagenes: string[]; nombre: string }) {
  const [activa, setActiva] = useState(0);
  const principal = imagenes[activa];

  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        {principal ? (
          <Image src={principal} alt={`${nombre} — imagen ${activa + 1}`} fill priority sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">Sin imagen</div>
        )}
      </div>
      {imagenes.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {imagenes.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActiva(i)}
              aria-label={`Ver imagen ${i + 1}`}
              className={`relative size-20 shrink-0 overflow-hidden border-2 transition ${i === activa ? "border-primary" : "border-transparent hover:border-border"}`}
            >
              <Image src={img} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
