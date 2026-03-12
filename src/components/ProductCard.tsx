import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  variantId?: string;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function ProductCard({ slug, title, price, compareAtPrice, imageUrl, variantId }: ProductCardProps) {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variantId) return;
    setAdding(true);
    await addToCart(variantId);
    setAdding(false);
  };

  return (
    <div className="group block bg-white dark:bg-background-soft rounded-2xl overflow-hidden shadow-pink-sm border border-border-soft hover:shadow-pink-lg transition-all duration-200">
      <Link to={`/producto/${slug}`} className="block">
        <div className="aspect-square bg-background-soft relative overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">✨</div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-secondary line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-bold text-primary">{formatPrice(price)}</span>
            {compareAtPrice && compareAtPrice > price && (
              <span className="text-sm text-gray-500 line-through">{formatPrice(compareAtPrice)}</span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          type="button"
          disabled={!variantId || adding}
          onClick={handleAddToCart}
          className="w-full py-2 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {adding ? '...' : t('common.addToCart')}
        </button>
      </div>
    </div>
  );
}
