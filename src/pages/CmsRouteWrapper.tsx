import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { CmsPageRenderer } from '../admin/cms-builder/CmsPageRenderer';
import { NotFoundPage } from './NotFoundPage';
import { CMS_BY_ROUTE } from '../graphql/cms-queries';

const PAGE_SUBTITLES: Record<string, string> = {
  '/nosotros': 'Conoce nuestra historia y pasión por la belleza.',
  '/preguntas-frecuentes': 'Encuentra respuestas a las dudas más comunes.',
  '/politicas': 'Nuestras políticas de compra y servicio.',
  '/tratamiento-de-datos': 'Cómo protegemos tu información.',
  '/mayoristas': 'Oportunidades para mayoristas.',
  '/punto-de-venta': 'Encuentra nuestros puntos de venta.',
};

interface CmsRouteWrapperProps {
  routePath: string;
  fallback: React.ReactNode;
}

export function CmsRouteWrapper({ routePath, fallback }: CmsRouteWrapperProps) {
  const { data, loading, refetch } = useQuery(CMS_BY_ROUTE, {
    variables: { routePath },
    errorPolicy: 'ignore',
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [refetch]);

  const page = data?.cmsPageByRoute;
  const layout = page?.layoutJson ? (typeof page.layoutJson === 'string' ? JSON.parse(page.layoutJson) : page.layoutJson) : null;

  if (import.meta.env.DEV) {
    if (!page) console.debug('[CmsRouteWrapper] No CMS page for', routePath, '- using fallback');
    else if (!page.published) console.debug('[CmsRouteWrapper] Page exists but unpublished - showing 404');
    else {
      const heroNode = layout?.root?.find((n: { type: string }) => n.type === 'HeroSection');
      const hasSlides = heroNode && 'slides' in (heroNode.props || {});
      const slideCount = hasSlides ? (heroNode.props?.slides as unknown[])?.length ?? 0 : 'N/A';
      console.debug('[CmsRouteWrapper] Using CMS layout, HeroSection slides:', hasSlides ? slideCount : 'undefined (will use heroContent)');
    }
  }

  if (loading) return <div className="py-12 text-center">Cargando...</div>;

  if (!page) {
    return (
      <>
        {import.meta.env.DEV && routePath === '/' && (
          <div className="p-3 text-center text-sm bg-amber-100 text-amber-800 border-b border-amber-200">
            Modo fallback: publica la página Inicio en el CMS para ver los cambios.
          </div>
        )}
        {fallback}
      </>
    );
  }

  if (!page.published) {
    return <NotFoundPage />;
  }
  const isCorePage = routePath === '/' || routePath === '/catalogo' || routePath === '/carrito';

  if (isCorePage) {
    return <CmsPageRenderer layout={layout || { root: [] }} />;
  }

  const subtitle = PAGE_SUBTITLES[routePath] ?? 'Estamos aquí para ayudarte.';

  return (
    <section className="page bg-white min-h-[50vh]" style={{ color: '#7c2859' }}>
      <div
        className="page-hero relative overflow-hidden py-9 mb-6"
        style={{ background: 'linear-gradient(180deg, #ffe8f2 0%, #ffd9ea 100%)' }}
      >
        <div className="hero-content max-w-[1280px] mx-auto px-6 text-center relative z-10">
          <h1 className="text-3xl font-extrabold tracking-wider uppercase mb-1" style={{ color: '#7c2859' }}>
            {page.title}
          </h1>
          <p className="hero-sub font-semibold" style={{ color: '#9a4b73' }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="page-shell max-w-[960px] mx-auto px-6 pb-8">
        <article
          className="page-card rounded-2xl p-6"
          style={{
            background: '#fff7fb',
            border: '1px solid #ffd7e7',
            boxShadow: '0 10px 24px rgba(255, 105, 175, 0.08)',
          }}
        >
          <div className="page-body leading-relaxed" style={{ color: '#7c2859' }}>
            <CmsPageRenderer layout={layout || { root: [] }} />
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
