import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';

const SEARCH_PRODUCTS = gql`
  query SearchProducts($query: String!, $limit: Int) {
    searchProducts(query: $query, limit: $limit) {
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
  query FeaturedProducts {
    featuredProducts(limit: 48) {
      id
      slug
      title
      variants { id price compareAtPrice }
      images { id url position }
    }
  }
`;

export function CatalogPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: searchData } = useQuery(SEARCH_PRODUCTS, {
    variables: { query, limit: 48 },
    skip: !query.trim(),
  });
  const { data: featuredData } = useQuery(FEATURED, {
    skip: !!query.trim(),
  });

  const products = query.trim() ? searchData?.searchProducts ?? [] : featuredData?.featuredProducts ?? [];

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-secondary mb-6">
        {query ? `Buscar: "${query}"` : 'Catálogo'}
      </h1>
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
  );
}
