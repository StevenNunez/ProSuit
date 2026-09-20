import Link from "next/link";
import Image from "next/image";
import { listarCategorias } from "@/lib/datos/catalogo";
import { FormularioContacto } from "@/components/tienda/FormularioContacto";

/* Portada réplica del sitio original (WordPress): mismas secciones, textos,
   imágenes y orden. Las mejoras van en una segunda etapa. */

const categoriasOriginales = [
  { nombre: "Uniforme Ejecutivo", imagen: "/img/cat-ejecutivo.jpg", href: "/tienda?categoria=uniforme-ejecutivo" },
  { nombre: "Ropa Industrial", imagen: "/img/cat-industrial.jpg", href: "/tienda?categoria=ropa-industrial" },
  { nombre: "Prendas Deportivas", imagen: "/img/cat-deportivo.jpg", href: "/tienda?categoria=prendas-deportivas" },
  { nombre: "Accesorios Corporativos", imagen: "/img/cat-accesorios.jpg", href: "/tienda?categoria=accesorios-corporativos" },
];

const propuestas = [
  { titulo: "Diseño Innovador", texto: "Confeccionamos prendas que combinan estilo y funcionalidad." },
  { titulo: "Materiales Premium", texto: "Utilizamos telas resistentes y cómodas para uso prolongado." },
  { titulo: "Atención Personalizada", texto: "Asesoramos para elegir el uniforme ideal según tu sector." },
  { titulo: "Entrega Puntual", texto: "Garantizamos tiempos de entrega ajustados a tus requerimientos." },
];

const beneficios = [
  "Diseño adaptable a cada sector",
  "Materiales resistentes y duraderos",
  "Producción rápida y eficiente",
  "Atención personalizada y asesoría",
  "Catálogo variado para todos los gustos",
];

export default async function PaginaInicio() {
  // Si el panel ya tiene categorías, se usan las 4 primeras; si no, las del sitio original.
  const categoriasDb = await listarCategorias();
  const categorias =
    categoriasDb.length >= 4
      ? categoriasDb.slice(0, 4).map((c) => ({ nombre: c.nombre, imagen: c.imagen_url ?? "/img/cat-ejecutivo.jpg", href: `/tienda?categoria=${c.slug}` }))
      : categoriasOriginales;

  return (
    <>
      {/* Hero */}
      <section className="bg-white">
        <div className="contenedor grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div>
            <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl lg:text-[64px]">
              Uniformes y prendas diseñadas para ti
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-foreground/85">
              En ProSuit creamos uniformes y prendas de vestir con calidad y estilo, adaptados a tus
              necesidades para destacar en tu sector.{" "}
              <strong>Viste a tu equipo con confort e imagen profesional.</strong>
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/tienda" className="btn-primario">Descubre más</Link>
              <Link href="/sobre" className="btn border-2 border-foreground text-foreground hover:bg-sand">Conoce más</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-6 pt-24">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image src="/img/hero-1.jpg" alt="Detalle de máquina de coser" fill priority sizes="(max-width: 1024px) 50vw, 15vw" className="object-cover" />
              </div>
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image src="/img/hero-2.jpg" alt="Hilos y materiales de confección" fill sizes="(max-width: 1024px) 50vw, 15vw" className="object-cover" />
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image src="/img/hero-3.jpg" alt="Confección en taller" fill priority sizes="(max-width: 1024px) 50vw, 15vw" className="object-cover" />
              </div>
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image src="/img/hero-4.jpg" alt="Equipo con uniformes" fill sizes="(max-width: 1024px) 50vw, 15vw" className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="bg-sand">
        <div className="contenedor py-24">
          <h2 className="max-w-xl font-display text-4xl leading-tight lg:text-[42px]">
            Uniformes personalizados con acabados excepcionales
          </h2>
          <p className="mt-5 max-w-2xl text-lg text-foreground/85">
            Explora nuestro catálogo exclusivo con prendas diseñadas para distintos sectores y promociones únicas.
          </p>
          <div className="mt-14 grid grid-cols-2 gap-8 lg:grid-cols-4">
            {categorias.map((c) => (
              <Link key={c.nombre} href={c.href} className="group">
                <div className="relative aspect-square overflow-hidden bg-white">
                  <Image src={c.imagen} alt={c.nombre} fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <h3 className="mt-5 font-display text-xl group-hover:text-primary">{c.nombre}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Nosotros */}
      <section className="bg-white">
        <div className="contenedor grid items-center gap-12 py-24 lg:grid-cols-[1fr_552px] lg:gap-20">
          <div>
            <h2 className="font-display text-4xl leading-tight lg:text-[42px]">Confección de uniformes adaptados a ti</h2>
            <p className="mt-5 text-lg leading-relaxed text-foreground/85">
              ProSuit se compromete a ofrecer calidad e innovación, valores que han guiado nuestra evolución en la
              confección de prendas para distintos sectores, asegurando la satisfacción y confianza de nuestros clientes.
            </p>
          </div>
          <div className="relative aspect-[552/440] overflow-hidden">
            <Image src="/img/nosotros-1.jpg" alt="Máquina de coser del taller" fill sizes="(max-width: 1024px) 100vw, 552px" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Propuestas */}
      <section className="bg-sand">
        <div className="contenedor py-24">
          <h2 className="font-display text-4xl leading-tight lg:text-[42px]">Uniformes personalizados para cada necesidad</h2>
          <p className="mt-4 text-lg text-foreground/85">Descubre nuestras propuestas exclusivas.</p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {propuestas.map((p) => (
              <div key={p.titulo} className="bg-white p-6">
                <h3 className="font-display text-xl">{p.titulo}</h3>
                <p className="mt-2 text-foreground/85">{p.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tela de primera */}
      <section className="bg-white">
        <div className="contenedor grid items-center gap-12 py-24 lg:grid-cols-[1fr_512px] lg:gap-20 lg:px-16">
          <div>
            <h2 className="font-display text-4xl leading-tight lg:text-[42px]">Uniformes personalizados con tela de primera</h2>
            <p className="mt-4 text-lg leading-relaxed text-foreground/85">
              Descubre cómo nuestros uniformes pueden mejorar la imagen de tu empresa y garantizar comodidad.
            </p>
            <ul className="mt-8 list-disc space-y-3 pl-10 text-foreground/85">
              {beneficios.map((b) => <li key={b}>{b}</li>)}
            </ul>
            <Link href="/tienda" className="btn-primario mt-12">Ver catálogo completo</Link>
          </div>
          <div className="relative aspect-[512/475] overflow-hidden">
            <Image src="/img/cta-taller.jpg" alt="Carretes de hilo de colores" fill sizes="(max-width: 1024px) 100vw, 512px" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="bg-sand" id="contacto">
        <div className="contenedor grid gap-12 py-24 lg:grid-cols-[1fr_720px] lg:gap-16">
          <div>
            <h2 className="max-w-md font-display text-4xl leading-tight lg:text-[42px]">Uniformes confeccionados para cada rubro</h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-foreground/85">
              Encuentra aquí todos los datos necesarios para contactar con nuestro equipo: direcciones,
              teléfonos y correos electrónicos, facilitando la comunicación para resolver dudas o solicitar información.
            </p>
          </div>
          <div className="bg-white px-8 py-12 sm:px-12">
            <FormularioContacto variante="original" />
          </div>
        </div>
      </section>
    </>
  );
}
