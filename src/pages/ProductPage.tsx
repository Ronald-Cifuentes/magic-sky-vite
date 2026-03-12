import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';

const PRODUCT_BY_SLUG = gql`
  query ProductBySlug($slug: String!) {
    productBySlug(slug: $slug) {
      id
      slug
      title
      descriptionHtml
      variants {
        id
        title
        price
        compareAtPrice
        sku
      }
      images {
        id
        url
        altText
        position
      }
    }
  }
`;

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [adding, setAdding] = useState(false);

  const { data, loading, error } = useQuery(PRODUCT_BY_SLUG, {
    variables: { slug: slug || '' },
  });

  const product = data?.productBySlug;

  if (loading) return <div className="py-12 text-center">Cargando...</div>;
  if (error || !product) return <div className="py-12 text-center">Producto no encontrado</div>;

  const variant = product.variants?.[selectedVariant] ?? product.variants?.[0];
  const images = product.images ?? [];
  const mainImage = images[selectedImage] ?? images[0];

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-background-soft rounded-2xl overflow-hidden mb-4">
            {mainImage?.url ? (
              <img src={mainImage.url} alt={mainImage.altText || product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">✨</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img: any, i: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    i === selectedImage ? 'border-primary' : 'border-border-soft'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary">{product.title}</h1>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-2xl font-bold text-primary">{formatPrice(variant?.price ?? 0)}</span>
            {variant?.compareAtPrice && variant.compareAtPrice > (variant?.price ?? 0) && (
              <span className="text-lg text-gray-500 line-through">{formatPrice(variant.compareAtPrice)}</span>
            )}
          </div>
          {product.variants && product.variants.length > 1 && (
            <div className="mt-4">
              <p className="font-semibold text-secondary mb-2">Variante:</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any, i: number) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(i)}
                    className={`px-4 py-2 rounded-xl border font-medium ${
                      i === selectedVariant
                        ? 'bg-primary text-white border-primary'
                        : 'border-border-soft text-secondary hover:bg-background-soft'
                    }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            type="button"
            disabled={!variant || adding}
            onClick={async () => {
              if (!variant) return;
              setAdding(true);
              await addToCart(variant.id);
              setAdding(false);
            }}
            className="mt-6 w-full py-4 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {adding ? 'Agregando...' : t('common.addToCart')}
          </button>
          {product.descriptionHtml && (
            <div
              className="mt-8 prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
