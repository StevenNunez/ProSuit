/**
 * Contenido editorial migrado del sitio WordPress original. Se mantiene en
 * código porque cambia poco; el catálogo, pedidos y ajustes viven en Supabase.
 */

export const preguntasFrecuentes = [
  {
    pregunta: "¿Qué tipos de prendas confeccionan?",
    respuesta: "Fabricamos uniformes corporativos, ropa laboral, prendas para salud, hostelería, industria y deporte, además de prendas a medida según sus necesidades específicas.",
  },
  {
    pregunta: "¿Cuál es el tiempo de entrega habitual?",
    respuesta: "Nuestro plazo estándar es de 15 a 20 días hábiles para pedidos a medida, ajustable según la complejidad y el volumen. Los productos con stock en la tienda se despachan en 1 a 3 días hábiles.",
  },
  {
    pregunta: "¿Ofrecen servicios de diseño personalizado?",
    respuesta: "Sí, contamos con un equipo dedicado para crear diseños que reflejen la identidad de su empresa: colores corporativos, bordado o estampado de logo y detalles a medida.",
  },
  {
    pregunta: "¿Realizan pedidos al por mayor?",
    respuesta: "Sí, ofrecemos precios especiales para compras en grandes volúmenes y proyectos corporativos. Escríbenos por WhatsApp para una cotización.",
  },
  {
    pregunta: "¿Qué materiales utilizan en la confección?",
    respuesta: "Usamos telas de alta calidad como poliéster, algodón, gabardina y mezclas técnicas para garantizar confort y resistencia en el uso diario.",
  },
  {
    pregunta: "¿Cómo puedo pagar?",
    respuesta: "En la tienda online puedes pagar con Mercado Pago (tarjetas de crédito, débito y otros medios) o por transferencia bancaria. Para pedidos corporativos emitimos factura.",
  },
  {
    pregunta: "¿Hacen envíos a todo Chile?",
    respuesta: "Sí. Despachamos a todas las regiones y también puedes retirar sin costo en nuestro taller en La Serena.",
  },
];

export const servicios = [
  {
    titulo: "Diseño personalizable",
    texto: "Ofrecemos opciones de diseño adaptadas a la identidad de tu empresa, asegurando uniformes únicos que refuercen tu imagen corporativa.",
  },
  {
    titulo: "Materiales de alta calidad",
    texto: "Utilizamos tejidos duraderos y cómodos que garantizan la resistencia y el confort de cada prenda durante su uso diario.",
  },
  {
    titulo: "Bordado y estampado",
    texto: "Incorporamos tu logo con bordado computarizado o estampado, en la ubicación y tamaño que definas.",
  },
  {
    titulo: "Entrega puntual",
    texto: "Cumplimos los tiempos acordados para que recibas tu pedido sin demoras, con seguimiento en cada etapa.",
  },
];

export const sectores = [
  { nombre: "Corporativo", texto: "Camisas, blusas, chaquetas y chalecos ejecutivos." },
  { nombre: "Salud", texto: "Batas, ambos y prendas clínicas cómodas y resistentes." },
  { nombre: "Industria", texto: "Overoles, polerones y ropa de trabajo de alta durabilidad." },
  { nombre: "Hostelería", texto: "Delantales, chaquetas de cocina y uniformes de atención." },
  { nombre: "Educación", texto: "Uniformes escolares e institucionales a medida." },
  { nombre: "Deporte", texto: "Poleras, shorts y buzos para equipos y eventos." },
];

export const equipo = [
  { nombre: "Laura Martínez", cargo: "Directora de Diseño", texto: "Con más de una década en moda corporativa, aporta innovación y precisión en cada proyecto.", imagen: "/img/equipo-7.jpg" },
  { nombre: "Carlos Pérez", cargo: "Gerente de Producción", texto: "Destaca por su capacidad de optimizar procesos y garantizar calidad constante.", imagen: "/img/equipo-4.jpg" },
  { nombre: "Sofía Gómez", cargo: "Líder de Ventas", texto: "Experta en estrategias comerciales y construcción de relaciones duraderas con clientes.", imagen: "/img/equipo-2.jpg" },
  { nombre: "Andrés Ruiz", cargo: "Especialista Técnico", texto: "Su enfoque en innovación técnica asegura prendas funcionales y duraderas.", imagen: "/img/equipo-1.jpg" },
];

export const cifras = [
  { valor: "150+", etiqueta: "Clientes satisfechos", texto: "Empresas que confían en nuestros uniformes para reforzar su imagen." },
  { valor: "250+", etiqueta: "Modelos disponibles", texto: "Diseños adaptados a diversos sectores y necesidades." },
  { valor: "500+", etiqueta: "Prendas producidas", texto: "Piezas confeccionadas combinando calidad y estilo." },
];

export const testimonios = [
  {
    nombre: "María Fernández",
    cargo: "Gerente de Recursos Humanos",
    texto: "Los uniformes entregados superaron nuestras expectativas gracias a la calidad y atención personalizada de ProSuit.",
  },
  {
    nombre: "Clínica dental en La Serena",
    cargo: "Caso de éxito",
    texto: "El diseño y confección de uniformes ayudó a mejorar la identidad de marca y la cohesión del equipo, incrementando la satisfacción del cliente final.",
  },
  {
    nombre: "Empresa de servicios industriales",
    cargo: "Caso de éxito",
    texto: "La experiencia en confección contribuyó a fortalecer la presencia corporativa y optimizar la comodidad laboral de nuestros operarios.",
  },
];

export const garantias = [
  "Calidad certificada en cada prenda",
  "Compromiso con la seguridad y durabilidad",
  "Reconocimientos que respaldan nuestra trayectoria",
  "Garantía de satisfacción y confianza",
];

export const recursos = [
  {
    titulo: "Diseño y materiales",
    resumen: "Conceptos clave sobre tejidos y estilos que garantizan durabilidad y comodidad.",
    contenido: [
      "Gabardina (65% poliéster / 35% algodón): la opción más usada en ropa laboral. Resiste el lavado frecuente, no se arruga fácilmente y mantiene el color.",
      "Piqué de algodón: ideal para poleras corporativas; fresco, con buena caída y excelente base para bordado.",
      "Tela antifluido: recomendada en salud y hostelería; repele líquidos y se seca rápido.",
      "Dry-fit: para prendas deportivas o de trabajo en calor; liviana y de secado rápido.",
    ],
  },
  {
    titulo: "Personalización y tallas",
    resumen: "Consejos prácticos para adaptar cada uniforme a las necesidades específicas del cliente.",
    contenido: [
      "Mide el contorno de pecho, cintura y cadera con la persona en ropa liviana y usa nuestra tabla de tallas; ante la duda, elige la talla mayor.",
      "Para pedidos corporativos pedimos una planilla con nombre, talla y cargo de cada persona: así etiquetamos cada prenda.",
      "El bordado se recomienda en logos de hasta 10 cm; para diseños grandes o con degradados, el estampado DTF da mejor resultado.",
      "Define ubicación (pecho izquierdo, manga, espalda) y colores Pantone del logo para asegurar fidelidad.",
    ],
  },
  {
    titulo: "Control de calidad",
    resumen: "Protocolos y técnicas para asegurar prendas impecables y resistentes.",
    contenido: [
      "Revisamos cada rollo de tela antes del corte (color, tramado, fallas).",
      "Costuras reforzadas en puntos de tensión: hombros, entrepierna y bolsillos.",
      "Inspección final prenda por prenda: hilos, botones, cierres y medida contra ficha técnica.",
      "Cuidado recomendado: lavar en frío, no usar cloro, planchar a temperatura media sobre el bordado por el revés.",
    ],
  },
];

export const galeria = [
  { src: "/img/galeria-1.jpg", alt: "Uniformes escolares en tonos burdeo" },
  { src: "/img/galeria-7.jpg", alt: "Uniforme institucional con detalles bordados" },
  { src: "/img/galeria-3.jpg", alt: "Detalle de tela y costura a mano" },
  { src: "/img/galeria-4.jpg", alt: "Carretes de hilo de colores del taller" },
  { src: "/img/galeria-5.jpg", alt: "Máquina de coser clásica" },
  { src: "/img/galeria-8.jpg", alt: "Kit de costura: tijeras, hilos y huincha" },
  { src: "/img/hero-4.jpg", alt: "Equipo de trabajo con uniformes verdes" },
  { src: "/img/servicios-2.jpg", alt: "Chaleco ejecutivo con corbata" },
  { src: "/img/prod-chaqueta.jpg", alt: "Chaqueta ejecutiva gris" },
  { src: "/img/cat-industrial.jpg", alt: "Poleras de colores en colgadores" },
];
