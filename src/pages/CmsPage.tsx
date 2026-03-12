import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';
import { Link } from 'react-router-dom';

const CMS_PAGE = gql`
  query CmsPageBySlug($slug: String!) {
    cmsPageBySlug(slug: $slug) {
      id
      slug
      title
      content
    }
  }
`;

const SUBTITLES: Record<string, string> = {
  nosotros: 'Conoce nuestra historia y pasión por la belleza.',
  contacto: 'Estamos aquí para ayudarte.',
  'preguntas-frecuentes': 'Encuentra respuestas a las dudas más comunes.',
  politicas: 'Nuestras políticas de compra y servicio.',
  'tratamiento-de-datos': 'Cómo protegemos tu información.',
  mayoristas: 'Oportunidades para mayoristas.',
  'punto-de-venta': 'Encuentra nuestros puntos de venta.',
};

const NOSOTROS_FALLBACK = `
<h2>Nuestra historia</h2>
<p>En <strong>Magic Sky</strong> creemos que cada persona merece sentirse hermosa, segura y auténtica. Nacimos en Medellín con la misión de acercar productos de belleza y maquillaje de alta calidad a quienes buscan realzar su estilo sin complicaciones.</p>
<h2>Nuestra pasión</h2>
<p>Somos apasionados por la cosmética y el cuidado personal. Cada producto que ofrecemos ha sido seleccionado con cuidado, pensando en durabilidad, pigmentación y fórmulas que respetan tu piel.</p>
<h2>Compromiso con la calidad</h2>
<p>Nos comprometemos a ofrecerte productos originales, con información clara sobre ingredientes y uso. Creemos en la transparencia y estamos aquí para ayudarte.</p>
<p><em>Gracias por confiar en nosotros. Estamos aquí para acompañarte en cada paso de tu viaje de belleza.</em></p>
`;

interface CmsPageProps {
  slug: string;
}

export function CmsPage({ slug }: CmsPageProps) {
  const { data, loading, error } = useQuery(CMS_PAGE, {
    variables: { slug },
  });

  const page = data?.cmsPageBySlug;
  const subtitle = SUBTITLES[slug] || 'Estamos aquí para ayudarte.';

  if (loading) return <div className="py-12 text-center">Cargando...</div>;
  if (error || !page) return <div className="py-12 text-center">Página no encontrada</div>;

  return (
    <section className="page bg-white min-h-[50vh]" style={{ color: '#7c2859' }}>
      {/* Hero - diseño page.liquid */}
      <div
        className="page-hero relative overflow-hidden py-9 mb-6"
        style={{
          background: 'linear-gradient(180deg, #ffe8f2 0%, #ffd9ea 100%)',
        }}
      >
        <div className="hero-content max-w-[1280px] mx-auto px-6 text-center relative z-10">
          <h1
            className="text-3xl font-extrabold tracking-wider uppercase mb-1"
            style={{ color: '#7c2859' }}
          >
            {page.title}
          </h1>
          <p className="hero-sub font-semibold" style={{ color: '#9a4b73' }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Contenido - page-card */}
      <div className="page-shell max-w-[960px] mx-auto px-6 pb-8">
        <article
          className="page-card rounded-2xl p-6"
          style={{
            background: '#fff7fb',
            border: '1px solid #ffd7e7',
            boxShadow: '0 10px 24px rgba(255, 105, 175, 0.08)',
          }}
        >
          <div
            className="page-body leading-relaxed"
            style={{ color: '#7c2859' }}
          >
            {(page.content || (slug === 'nosotros' ? NOSOTROS_FALLBACK : null)) && (
              <div
                className="prose prose-pink max-w-none prose-headings:text-secondary prose-a:text-primary"
                dangerouslySetInnerHTML={{
                  __html: page.content || (slug === 'nosotros' ? NOSOTROS_FALLBACK : ''),
                }}
              />
            )}
          </div>
          <div className="page-actions flex flex-wrap gap-3 mt-6">
            <Link
              to="/catalogo"
              className="inline-block px-5 py-3 rounded-xl font-extrabold text-white no-underline"
              style={{
                background: '#f04793',
                boxShadow: '0 12px 20px rgba(240, 71, 147, 0.22)',
              }}
            >
              Ver productos
            </Link>
            <Link
              to="/"
              className="inline-block px-5 py-3 rounded-xl font-extrabold no-underline"
              style={{
                background: '#fff',
                color: '#f04793',
                border: '1px solid #ffd7e7',
                boxShadow: '0 8px 16px rgba(255, 105, 175, 0.12)',
              }}
            >
              Ir al inicio
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
