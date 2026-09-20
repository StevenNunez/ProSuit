import Link from "next/link";
import Image from "next/image";
import InteractiveLogo from "@/components/InteractiveLogo";
import { sitio } from "@/lib/sitio";
import type { AjustesTienda } from "@/lib/tipos";

/** Pie fiel al original: logo centrado y el lema en monoespaciado, escalonado. */
export default function PieDePagina({ tienda }: { tienda: AjustesTienda }) {
  return (
    <footer className="mt-auto bg-white">
      <div className="contenedor flex flex-col items-center py-20 lg:py-28">
        <Link href="/" aria-label="Ir al inicio">
          <Image src="/img/logo.webp" alt={sitio.nombre} width={165} height={165} className="size-[165px]" />
        </Link>
        <div className="mt-20 font-mono text-2xl text-foreground/80 lg:text-[27px]">
          <p>Diseño a la Vista.</p>
          <p className="mt-8 pl-16 lg:pl-52">Calidad al Tacto.</p>
        </div>
      </div>
      <div className="contenedor flex flex-col items-center justify-between gap-2 border-t border-border/60 py-4 text-xs text-muted sm:flex-row">
        <p>© {new Date().getFullYear()} {tienda.nombre} · {tienda.direccion} · {tienda.telefono}</p>
        <p className="flex items-center gap-1.5">
          Desarrollado por{" "}
          <a href="https://www.teolabs.app" target="_blank" rel="noopener noreferrer" className="inline-flex">
            <InteractiveLogo variant="footer-small" className="text-[14px]" />
          </a>{" "}
          ®
        </p>
      </div>
    </footer>
  );
}
