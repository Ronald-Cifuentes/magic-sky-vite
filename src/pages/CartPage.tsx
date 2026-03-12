import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function CartPage() {
  const { t } = useTranslation();
  const { cartItems, cartCount, removeFromCart, updateQuantity } = useCart();
  const [removing, setRemoving] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  if (cartCount === 0) {
    return (
      <section className="cart-section bg-white text-secondary min-h-[60vh]" style={{ color: '#7c2859' }}>
        <div
          className="cart-hero relative overflow-hidden py-9 mb-5"
          style={{
            background: 'linear-gradient(180deg, #ffe8f2 0%, #ffd9ea 100%)',
          }}
        >
          <div className="hero-content max-w-[1280px] mx-auto px-6 text-center relative z-10">
            <h1 className="text-3xl font-extrabold tracking-wider uppercase mb-1" style={{ color: '#7c2859' }}>
              {t('nav.cart')}
            </h1>
            <p className="hero-sub font-semibold" style={{ color: '#9a4b73' }}>
              Revisa tus productos antes de finalizar la compra.
            </p>
          </div>
        </div>

        <div className="cart-shell max-w-[1280px] mx-auto px-6 pb-8">
          <div
            className="cart-empty rounded-2xl p-8 text-center grid gap-4 justify-items-center"
            style={{
              background: '#fff7fb',
              border: '1px solid #ffd7e7',
              boxShadow: '0 10px 24px rgba(255, 105, 175, 0.08)',
            }}
          >
            <p className="text-secondary">Tu carrito está vacío.</p>
            <Link
              to="/catalogo"
              className="btn-primary inline-block px-5 py-3 rounded-xl font-extrabold text-white no-underline"
              style={{
                background: '#f04793',
                boxShadow: '0 12px 20px rgba(240, 71, 147, 0.22)',
              }}
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const subtotal = cartItems.reduce((sum, it) => sum + it.variant.price * it.quantity, 0);

  return (
    <section className="cart-section bg-white text-secondary min-h-[60vh]" style={{ color: '#7c2859' }}>
      {/* Hero */}
      <div
        className="cart-hero relative overflow-hidden py-9 mb-5"
        style={{
          background: 'linear-gradient(180deg, #ffe8f2 0%, #ffd9ea 100%)',
        }}
      >
        <div className="hero-content max-w-[1280px] mx-auto px-6 text-center relative z-10">
          <h1 className="text-3xl font-extrabold tracking-wider uppercase mb-1" style={{ color: '#7c2859' }}>
            {t('nav.cart')}
          </h1>
          <p className="hero-sub font-semibold" style={{ color: '#9a4b73' }}>
            Revisa tus productos antes de finalizar la compra.
          </p>
        </div>
      </div>

      <div className="cart-shell max-w-[1280px] mx-auto px-6 pb-8">
        <div className="cart-form grid gap-5 items-start lg:grid-cols-[2fr_1fr]">
          {/* Cart list */}
          <div className="cart-list grid gap-4">
            {cartItems.map((item) => (
              <article
                key={item.id}
                className="cart-item grid gap-4 p-4 rounded-2xl items-center lg:grid-cols-[110px_1fr]"
                style={{
                  background: '#fff7fb',
                  border: '1px solid #ffd7e7',
                  boxShadow: '0 10px 24px rgba(255, 105, 175, 0.08)',
                }}
              >
                <div
                  className="item-media rounded-xl overflow-hidden flex-shrink-0 w-[120px] h-[120px] p-1.5 mx-auto lg:mx-0"
                  style={{
                    background: 'linear-gradient(180deg, #fff, #ffe8f2)',
                  }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productTitle || item.variant.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">✨</div>
                  )}
                </div>

                <div className="item-info grid gap-1">
                  <div className="item-header flex justify-between gap-3 items-start">
                    <h3 className="item-title text-base font-extrabold m-0" style={{ color: '#7c2859' }}>
                      {item.productSlug ? (
                        <Link
                          to={`/producto/${item.productSlug}`}
                          className="hover:underline"
                          style={{ color: '#7c2859', textDecoration: 'none' }}
                        >
                          {item.productTitle || item.variant.title}
                        </Link>
                      ) : (
                        item.productTitle || item.variant.title
                      )}
                    </h3>
                    <button
                      type="button"
                      disabled={removing === item.id}
                      onClick={async () => {
                        setRemoving(item.id);
                        await removeFromCart(item.id);
                        setRemoving(null);
                      }}
                      className="remove-link bg-transparent border-0 cursor-pointer font-bold text-primary hover:underline disabled:opacity-50"
                      style={{ color: '#f04793' }}
                    >
                      {t('cart.remove', 'Quitar')}
                    </button>
                  </div>

                  {item.variant.title && item.variant.title !== 'Default Title' && (
                    <p className="item-variant text-sm font-semibold m-0" style={{ color: '#9a4b73' }}>
                      {item.variant.title}
                    </p>
                  )}

                  <p className="item-price font-extrabold text-base m-0" style={{ color: '#f04793' }}>
                    {formatPrice(item.variant.price * item.quantity)}
                  </p>

                  <div className="item-actions flex items-center gap-2 flex-wrap">
                    <label className="qty-label font-bold" style={{ color: '#7c2859' }}>
                      Cantidad
                    </label>
                    <div
                      className="qty-control inline-flex items-center gap-1 rounded-lg px-2 py-1"
                      style={{
                        background: '#fff',
                        border: '1px solid #ffd7e7',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
                      }}
                    >
                      <button
                        type="button"
                        disabled={updating === item.id}
                        onClick={async () => {
                          const next = item.quantity - 1;
                          setUpdating(item.id);
                          await updateQuantity(item.id, next <= 0 ? 0 : next);
                          setUpdating(null);
                        }}
                        className="qty-btn w-7 h-7 rounded-lg bg-transparent border-0 font-extrabold cursor-pointer flex items-center justify-center hover:bg-[#ffeef7] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ color: '#f04793' }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          if (!isNaN(v) && v >= 0) {
                            setUpdating(item.id);
                            updateQuantity(item.id, v).finally(() => setUpdating(null));
                          }
                        }}
                        className="w-[60px] border-0 text-center font-bold bg-transparent focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        style={{ color: '#7c2859' }}
                        aria-label="Cantidad"
                      />
                      <button
                        type="button"
                        disabled={updating === item.id}
                        onClick={async () => {
                          setUpdating(item.id);
                          await updateQuantity(item.id, item.quantity + 1);
                          setUpdating(null);
                        }}
                        className="qty-btn w-7 h-7 rounded-lg bg-transparent border-0 font-extrabold cursor-pointer flex items-center justify-center hover:bg-[#ffeef7] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ color: '#f04793' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary lg:sticky lg:top-[120px]">
            <div
              className="summary-card rounded-2xl p-5 grid gap-3"
              style={{
                background: '#fff7fb',
                border: '1px solid #ffd7e7',
                boxShadow: '0 10px 24px rgba(255, 105, 175, 0.08)',
              }}
            >
              <div className="summary-row flex justify-between items-center font-extrabold" style={{ color: '#7c2859' }}>
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <p className="note text-sm font-semibold m-0" style={{ color: '#9a4b73' }}>
                Los costos de envío y descuentos se calculan al finalizar la compra.
              </p>
              <div className="summary-actions grid gap-2">
                <Link
                  to="/catalogo"
                  className="btn-secondary text-center py-3 px-5 rounded-xl font-extrabold no-underline"
                  style={{
                    background: '#fff',
                    color: '#f04793',
                    border: '1px solid #ffd7e7',
                    boxShadow: '0 8px 16px rgba(255, 105, 175, 0.12)',
                  }}
                >
                  Seguir comprando
                </Link>
                <Link
                  to="/checkout"
                  className="btn-primary text-center py-4 rounded-xl font-extrabold text-white no-underline block"
                  style={{
                    background: '#f04793',
                    boxShadow: '0 12px 20px rgba(240, 71, 147, 0.22)',
                  }}
                >
                  {t('cart.checkout', 'Finalizar compra')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
