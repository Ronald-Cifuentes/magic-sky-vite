import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';
import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';

const FEATURED_PRODUCTS = gql`
  query FeaturedProducts {
    featuredProducts(limit: 12) {
      id
      slug
      title
      variants {
        id
        price
        compareAtPrice
      }
      images {
        id
        url
        position
      }
    }
  }
`;

const COLLECTIONS = gql`
  query Collections {
    collections {
      id
      name
      slug
      imageUrl
      products {
        product {
          id
          slug
          title
          variants { id price compareAtPrice }
          images { id url position }
        }
      }
    }
  }
`;

const HERO = gql`
  query HeroContent {
    heroContent {
      id
      title
      subtitle
      imageUrl
      linkUrl
    }
  }
`;

export function HomePage() {
  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(FEATURED_PRODUCTS, {
    errorPolicy: 'ignore',
  });
  const { data: collectionsData } = useQuery(COLLECTIONS, { errorPolicy: 'ignore' });
  const { data: heroData } = useQuery(HERO, { errorPolicy: 'ignore' });

  const products = productsData?.featuredProducts ?? [];
  const collections = collectionsData?.collections ?? [];
  const heroSlides = heroData?.heroContent ?? [];
  const apiUnavailable = !!productsError;

  return (
    <div>
      {heroSlides.length > 0 ? (
        <section className="relative overflow-hidden">
          <div className="aspect-[21/9] min-h-[200px] bg-gradient-to-r from-primary-light to-primary flex items-center justify-center">
            {heroSlides[0]?.imageUrl ? (
              <img
                src={heroSlides[0].imageUrl}
                alt={heroSlides[0].title || 'Magic Sky'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-white px-4">
                <h1 className="text-3xl md:text-5xl font-bold">Magic Sky</h1>
                <p className="text-xl mt-2 opacity-90">{heroSlides[0]?.subtitle || 'Belleza y maquillaje'}</p>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section
          className="py-16 md:py-24 px-4 text-center"
          style={{ background: 'linear-gradient(90deg, #ff7bb6, #ff4f9c)' }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white">Magic Sky</h1>
          <p className="text-xl mt-4 text-white/90">Belleza y maquillaje para ti</p>
          <Link
            to="/catalogo"
            className="inline-block mt-8 px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
          >
            Ver catálogo
          </Link>
        </section>
      )}

      {collections.length > 0 && (
        <section className="py-12 px-4 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-secondary mb-6">Colecciones</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {collections.map((col: any) => (
              <Link
                key={col.id}
                to={`/coleccion/${col.slug}`}
                className="block aspect-square rounded-2xl overflow-hidden bg-background-soft border border-border-soft hover:shadow-pink transition-shadow"
              >
                {col.imageUrl ? (
                  <img src={col.imageUrl} alt={col.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary text-2xl font-bold">
                    {col.name}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-secondary mb-6">Productos destacados</h2>
        {apiUnavailable && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
            <p className="font-semibold">Backend no disponible</p>
            <p className="text-sm mt-1">Inicia PostgreSQL y el backend para ver productos. Ejecuta: <code className="bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded">docker compose up -d</code> y luego <code className="bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded">cd backend && pnpm start:dev</code></p>
          </div>
        )}
        {productsLoading && !apiUnavailable && (
          <p className="text-center text-gray-500 py-12">Cargando productos...</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p: any) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              title={p.title}
              price={p.variants?.[0]?.price ?? 0}
              compareAtPrice={p.variants?.[0]?.compareAtPrice}
              imageUrl={p.images?.[0]?.url}
              variantId={p.variants?.[0]?.id}
            />
          ))}
        </div>
        {products.length === 0 && !productsLoading && !apiUnavailable && (
          <p className="text-center text-gray-500 py-12">No hay productos aún. Ejecuta el seed e importador.</p>
        )}
      </section>
    </div>
  );
}
