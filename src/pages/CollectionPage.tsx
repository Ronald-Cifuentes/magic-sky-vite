import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';
import { ProductCard } from '../components/ProductCard';

const COLLECTION_BY_SLUG = gql`
  query CollectionBySlug($slug: String!) {
    collectionBySlug(slug: $slug) {
      id
      name
      slug
      description
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

export function CollectionPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error } = useQuery(COLLECTION_BY_SLUG, {
    variables: { slug: slug || '' },
  });

  const collection = data?.collectionBySlug;

  if (loading) return <div className="py-12 text-center">Cargando...</div>;
  if (error || !collection) return <div className="py-12 text-center">Colección no encontrada</div>;

  const products = collection.products?.map((p: any) => p.product).filter(Boolean) ?? [];

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-secondary mb-2">{collection.name}</h1>
      {collection.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-6">{collection.description}</p>
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
        <p className="text-center text-gray-500 py-12">No hay productos en esta colección.</p>
      )}
    </div>
  );
}
