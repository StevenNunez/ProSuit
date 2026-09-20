import Link from "next/link";
import Image from "next/image";

export default function NoEncontrado() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <Image src="/img/logo.webp" alt="ProSuit" width={80} height={80} />
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Error 404</p>
      <h1 className="font-display text-3xl font-bold">Página no encontrada</h1>
      <p className="max-w-md text-muted">El enlace puede haber cambiado con la nueva tienda. Te llevamos de vuelta.</p>
      <div className="mt-2 flex gap-3">
        <Link href="/" className="btn-primario">Ir al inicio</Link>
        <Link href="/tienda" className="btn-secundario">Ver la tienda</Link>
      </div>
    </div>
  );
}
