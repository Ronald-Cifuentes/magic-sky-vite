import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';

const SEARCH_PRODUCTS = gql`
  query SearchProducts($query: String!, $limit: Int, $categorySlug: String) {
    searchProducts(query: $query, limit: $limit, categorySlug: $categorySlug) {
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

const FEATURED = gql`
  query FeaturedProducts($categorySlug: String) {
    featuredProducts(limit: 48, categorySlug: $categorySlug) {
      id
      slug
      title
      variants { id price compareAtPrice }
      images { id url position }
    }
  }
`;

const CATEGORIES = gql`
  query Categories {
    categories {
      id
      name
      slug
    }
  }
`;

export function CatalogPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const categorySlug = searchParams.get('categoria') || '';
  const [searchInput, setSearchInput] = useState(query);
  const isSearchPage = location.pathname === '/buscar';

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const { data: searchData } = useQuery(SEARCH_PRODUCTS, {
    variables: { query: query || ' ', limit: 48, categorySlug: categorySlug || null },
    skip: !query.trim(),
  });
  const { data: featuredData } = useQuery(FEATURED, {
    variables: { categorySlug: categorySlug || null },
    skip: !!query.trim(),
  });
  const { data: categoriesData } = useQuery(CATEGORIES);
  const categories = categoriesData?.categories ?? [];

  const searchResults = searchData?.searchProducts ?? [];
  const featuredResults = featuredData?.featuredProducts ?? [];
  const products = query.trim() ? (searchResults.length > 0 ? searchResults : featuredResults) : featuredResults;
  const showingFallback = query.trim() && searchResults.length === 0 && featuredResults.length > 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    const params = new URLSearchParams(searchParams);
    if (q) params.set('q', q);
    else params.delete('q');
    navigate(q ? `/buscar?${params}` : `/catalogo?${params}`);
  };

  const setCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set('categoria', slug);
    else params.delete('categoria');
    navigate(`${location.pathname}?${params}`);
  };

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      {isSearchPage && (
        <div
          className="mb-8 py-8 rounded-2xl text-center"
          style={{ background: 'linear-gradient(180deg, #ffe8f2 0%, #ffd9ea 100%)' }}
        >
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#7c2859' }}>
            Buscar
          </h1>
          <p className="text-sm font-semibold mb-4" style={{ color: '#9a4b73' }}>
            Encuentra productos, páginas o artículos.
          </p>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar productos..."
              className="flex-1 px-4 py-3 rounded-xl border border-[#ffd7e7] bg-white font-semibold"
              style={{ color: '#7c2859' }}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-extrabold text-white"
              style={{ background: '#f04793', boxShadow: '0 12px 20px rgba(240, 71, 147, 0.22)' }}
            >
              Buscar
            </button>
          </form>
        </div>
      )}

      {!isSearchPage && (
        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar en el catálogo..."
            className="flex-1 max-w-md px-4 py-2 rounded-xl border border-border-soft bg-white"
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-primary text-white font-semibold">
            Buscar
          </button>
        </form>
      )}

      {categories.length > 0 && (
        <div className="md:hidden flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium ${
              !categorySlug ? 'bg-primary text-white' : 'bg-background-soft border border-border-soft'
            }`}
          >
            Todas
          </button>
          {categories.map((c: { id: string; name: string; slug: string }) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.slug === categorySlug ? '' : c.slug)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium ${
                c.slug === categorySlug ? 'bg-primary text-white' : 'bg-background-soft border border-border-soft'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-6">
        {categories.length > 0 && (
          <aside className="w-56 shrink-0 hidden md:block">
            <div className="sticky top-24 p-4 rounded-xl border border-border-soft bg-background-soft">
              <p className="font-bold text-secondary mb-3">Categorías</p>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setCategory('')}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                    !categorySlug ? 'bg-primary text-white' : 'text-secondary hover:bg-border-soft'
                  }`}
                >
                  Todas
                </button>
                {categories.map((c: { id: string; name: string; slug: string }) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.slug === categorySlug ? '' : c.slug)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                      c.slug === categorySlug ? 'bg-primary text-white' : 'text-secondary hover:bg-border-soft'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-secondary mb-6">
            {query ? `Buscar: "${query}"` : 'Catálogo'}
          </h2>
          {showingFallback && (
            <p className="mb-4 text-sm text-amber-700 bg-amber-50 px-4 py-2 rounded-lg">
              No se encontraron resultados exactos para &quot;{query}&quot;. Mostrando productos destacados.
            </p>
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
          {products.length === 0 && (
            <p className="text-center text-gray-500 py-12">No se encontraron productos.</p>
          )}
        </div>
      </div>
    </div>
  );
}
