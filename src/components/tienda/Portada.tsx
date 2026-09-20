import Link from "next/link";

interface Props {
  titulo: string;
  subtitulo?: string;
  descripcion?: string;
  migas?: { href: string; etiqueta: string }[];
}

/** Cabecera de las páginas internas, con el estilo del sitio original (fondo blanco, título condensado). */
export default function Portada({ titulo, subtitulo, descripcion, migas }: Props) {
  return (
    <section className="bg-white">
      <div className="contenedor py-14 lg:py-20">
        {migas && (
          <nav aria-label="Migas de pan" className="mb-4 text-xs text-muted">
            <ol className="flex flex-wrap gap-1.5">
              <li><Link href="/" className="hover:text-primary">Inicio</Link></li>
              {migas.map((m) => (
                <li key={m.href} className="flex gap-1.5">
                  <span>/</span>
                  <Link href={m.href} className="hover:text-primary">{m.etiqueta}</Link>
                </li>
              ))}
            </ol>
          </nav>
        )}
        {subtitulo && <p className="font-display text-xl text-foreground/70">{subtitulo}</p>}
        <h1 className="mt-2 max-w-3xl font-display text-4xl leading-tight sm:text-5xl lg:text-[56px]">{titulo}</h1>
        {descripcion && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/85">{descripcion}</p>}
      </div>
    </section>
  );
}
