import { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { useAnnouncement } from '../../context/AnnouncementContext';
import { gql } from '@apollo/client/core';
import { Link, useSearchParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { ProductCard } from '../../components/ProductCard';
import { useCart } from '../../context/CartContext';

const HERO = gql`query HeroContent { heroContent { id title subtitle imageUrl linkUrl } }`;
const FEATURED = gql`query FeaturedProducts($limit: Float, $categorySlug: String) { featuredProducts(limit: $limit, categorySlug: $categorySlug) { id slug title variants { id price compareAtPrice } images { id url position } } }`;
const COLLECTIONS = gql`query Collections { collections { id name slug imageUrl } }`;
const CATEGORIES = gql`query Categories { categories { id name slug } }`;
const ANNOUNCEMENT = gql`query AnnouncementBar { announcementBar { id text linkUrl } }`;

function formatPrice(cents: number) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(cents / 100);
}

interface HeroSlideData {
  id?: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  linkUrl?: string;
}

export function HeroSectionRender({ slides: cmsSlides }: { slides?: HeroSlideData[] }) {
  const { data } = useQuery(HERO, { errorPolicy: 'ignore' });
  const apiSlides = data?.heroContent ?? [];
  const useCms = cmsSlides !== undefined;
  const slides = useCms
    ? (Array.isArray(cmsSlides) ? cmsSlides : []).map((s, i) => ({ ...s, id: s.id ?? `cms-${i}` }))
    : apiSlides;
  if (slides.length === 0) {
    return (
      <section className="py-16 md:py-24 px-4 text-center" style={{ background: 'linear-gradient(90deg, #ff7bb6, #ff4f9c)' }}>
        <h1 className="text-4xl md:text-6xl font-bold text-white">Magic Sky</h1>
        <p className="text-xl mt-4 text-white/90">Belleza y maquillaje para ti</p>
        <Link to="/catalogo" className="inline-block mt-8 px-8 py-4 bg-white text-primary font-bold rounded-xl shadow-lg">
          Ver catálogo
        </Link>
      </section>
    );
  }
  return (
    <section className="relative overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        centeredSlides
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        className="aspect-[21/9] min-h-[200px] w-full"
      >
        {slides.map((slide: HeroSlideData & { id?: string }, i: number) => (
          <SwiperSlide key={slide.id ?? i}>
            <div className="w-full h-full bg-gradient-to-r from-primary-light to-primary flex items-center justify-center">
              {slide.imageUrl ? (
                <Link to={slide.linkUrl || '/catalogo'} className="block w-full h-full">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title || 'Magic Sky'}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ) : (
                <Link to={slide.linkUrl || '/catalogo'} className="text-center text-white px-4 block">
                  <h1 className="text-3xl md:text-5xl font-bold">{slide.title || 'Magic Sky'}</h1>
                  <p className="text-xl mt-2 opacity-90">{slide.subtitle || 'Belleza y maquillaje'}</p>
                </Link>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

export function FeaturedProductsRender({ limit = 12 }: { limit?: number }) {
  const { data, loading, error } = useQuery(FEATURED, { variables: { limit }, errorPolicy: 'ignore' });
  const products = data?.featuredProducts ?? [];
  if (error) return <p className="text-amber-600 py-4">Error al cargar productos</p>;
  if (loading) return <p className="text-gray-500 py-4">Cargando...</p>;
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-secondary mb-6">Productos destacados</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.slice(0, limit).map((p: any) => (
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
    </section>
  );
}

export function ProductGridRender({ title = 'Catálogo' }: { title?: string }) {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('categoria') || '';
  const { data: featured } = useQuery(FEATURED, {
    variables: { limit: 48, categorySlug: categorySlug || null },
    errorPolicy: 'ignore',
  });
  const { data: catData } = useQuery(CATEGORIES, { errorPolicy: 'ignore' });
  const products = featured?.featuredProducts ?? [];
  const categories = catData?.categories ?? [];

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:gap-6">
        {categories.length > 0 && (
          <aside className="md:w-56 shrink-0 mb-4 md:mb-0">
            <div className="p-4 rounded-xl border border-border-soft bg-background-soft">
              <p className="font-bold text-secondary mb-3">Categorías</p>
              <div className="flex flex-wrap gap-2 md:flex-col md:gap-1">
                <Link
                  to="/catalogo"
                  className={`inline-block px-3 py-2 rounded-lg text-sm font-medium ${
                    !categorySlug ? 'bg-primary text-white' : 'text-secondary hover:bg-border-soft'
                  }`}
                >
                  Todas
                </Link>
                {categories.map((c: { id: string; name: string; slug: string }) => (
                  <Link
                    key={c.id}
                    to={`/catalogo?categoria=${c.slug}`}
                    className={`inline-block px-3 py-2 rounded-lg text-sm font-medium ${
                      c.slug === categorySlug ? 'bg-primary text-white' : 'text-secondary hover:bg-border-soft'
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-secondary mb-6">{title}</h1>
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
            <p className="text-center text-gray-500 py-12">No hay productos en esta categoría.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function CartContentRender() {
  const { cartItems, cartCount, removeFromCart, updateQuantity } = useCart();
  const [removing, setRemoving] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  if (cartCount === 0) {
    return (
      <section className="cart-section bg-white text-secondary min-h-[60vh]" style={{ color: '#7c2859' }}>
        <div className="cart-hero relative overflow-hidden py-9 mb-5" style={{ background: 'linear-gradient(180deg, #ffe8f2 0%, #ffd9ea 100%)' }}>
          <div className="hero-content max-w-[1280px] mx-auto px-6 text-center relative z-10">
            <h1 className="text-3xl font-extrabold tracking-wider uppercase mb-1" style={{ color: '#7c2859' }}>Carrito</h1>
            <p className="hero-sub font-semibold" style={{ color: '#9a4b73' }}>Revisa tus productos antes de finalizar la compra.</p>
          </div>
        </div>
        <div className="cart-shell max-w-[1280px] mx-auto px-6 pb-8">
          <div className="cart-empty rounded-2xl p-8 text-center grid gap-4 justify-items-center" style={{ background: '#fff7fb', border: '1px solid #ffd7e7', boxShadow: '0 10px 24px rgba(255, 105, 175, 0.08)' }}>
            <p className="text-secondary">Tu carrito está vacío.</p>
            <Link to="/catalogo" className="btn-primary inline-block px-5 py-3 rounded-xl font-extrabold text-white no-underline" style={{ background: '#f04793', boxShadow: '0 12px 20px rgba(240, 71, 147, 0.22)' }}>Seguir comprando</Link>
          </div>
        </div>
      </section>
    );
  }

  const subtotal = cartItems.reduce((sum, it) => sum + it.variant.price * it.quantity, 0);

  return (
    <section className="cart-section bg-white text-secondary min-h-[60vh]" style={{ color: '#7c2859' }}>
      <div className="cart-hero relative overflow-hidden py-9 mb-5" style={{ background: 'linear-gradient(180deg, #ffe8f2 0%, #ffd9ea 100%)' }}>
        <div className="hero-content max-w-[1280px] mx-auto px-6 text-center relative z-10">
          <h1 className="text-3xl font-extrabold tracking-wider uppercase mb-1" style={{ color: '#7c2859' }}>Carrito</h1>
          <p className="hero-sub font-semibold" style={{ color: '#9a4b73' }}>Revisa tus productos antes de finalizar la compra.</p>
        </div>
      </div>
      <div className="cart-shell max-w-[1280px] mx-auto px-6 pb-8">
        <div className="cart-form grid gap-5 items-start lg:grid-cols-[2fr_1fr]">
          <div className="cart-list grid gap-4">
            {cartItems.map((item) => (
              <article key={item.id} className="cart-item grid gap-4 p-4 rounded-2xl items-center lg:grid-cols-[110px_1fr]" style={{ background: '#fff7fb', border: '1px solid #ffd7e7', boxShadow: '0 10px 24px rgba(255, 105, 175, 0.08)' }}>
                <div className="item-media rounded-xl overflow-hidden flex-shrink-0 w-[120px] h-[120px] p-1.5 mx-auto lg:mx-0" style={{ background: 'linear-gradient(180deg, #fff, #ffe8f2)' }}>
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.productTitle || item.variant.title} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center text-3xl">✨</div>}
                </div>
                <div className="item-info grid gap-1">
                  <div className="item-header flex justify-between gap-3 items-start">
                    <h3 className="item-title text-base font-extrabold m-0" style={{ color: '#7c2859' }}>
                      {item.productSlug ? <Link to={`/producto/${item.productSlug}`} className="hover:underline" style={{ color: '#7c2859', textDecoration: 'none' }}>{item.productTitle || item.variant.title}</Link> : (item.productTitle || item.variant.title)}
                    </h3>
                    <button type="button" disabled={removing === item.id} onClick={async () => { setRemoving(item.id); await removeFromCart(item.id); setRemoving(null); }} className="remove-link bg-transparent border-0 cursor-pointer font-bold hover:underline disabled:opacity-50" style={{ color: '#f04793' }}>Quitar</button>
                  </div>
                  {item.variant.title && item.variant.title !== 'Default Title' && <p className="item-variant text-sm font-semibold m-0" style={{ color: '#9a4b73' }}>{item.variant.title}</p>}
                  <p className="item-price font-extrabold text-base m-0" style={{ color: '#f04793' }}>{formatPrice(item.variant.price * item.quantity)}</p>
                  <div className="item-actions flex items-center gap-2 flex-wrap">
                    <label className="qty-label font-bold" style={{ color: '#7c2859' }}>Cantidad</label>
                    <div className="qty-control inline-flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: '#fff', border: '1px solid #ffd7e7', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)' }}>
                      <button type="button" disabled={updating === item.id} onClick={async () => { const next = item.quantity - 1; setUpdating(item.id); await updateQuantity(item.id, next <= 0 ? 0 : next); setUpdating(null); }} className="qty-btn w-7 h-7 rounded-lg bg-transparent border-0 font-extrabold cursor-pointer flex items-center justify-center hover:bg-[#ffeef7] disabled:opacity-50 disabled:cursor-not-allowed" style={{ color: '#f04793' }}>−</button>
                      <input type="number" min={1} value={item.quantity} onChange={(e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v) && v >= 0) { setUpdating(item.id); updateQuantity(item.id, v).finally(() => setUpdating(null)); } }} className="w-[60px] border-0 text-center font-bold bg-transparent focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" style={{ color: '#7c2859' }} aria-label="Cantidad" />
                      <button type="button" disabled={updating === item.id} onClick={async () => { setUpdating(item.id); await updateQuantity(item.id, item.quantity + 1); setUpdating(null); }} className="qty-btn w-7 h-7 rounded-lg bg-transparent border-0 font-extrabold cursor-pointer flex items-center justify-center hover:bg-[#ffeef7] disabled:opacity-50 disabled:cursor-not-allowed" style={{ color: '#f04793' }}>+</button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="cart-summary lg:sticky lg:top-[120px]">
            <div className="summary-card rounded-2xl p-5 grid gap-3" style={{ background: '#fff7fb', border: '1px solid #ffd7e7', boxShadow: '0 10px 24px rgba(255, 105, 175, 0.08)' }}>
              <div className="summary-row flex justify-between items-center font-extrabold" style={{ color: '#7c2859' }}><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
              <p className="note text-sm font-semibold m-0" style={{ color: '#9a4b73' }}>Los costos de envío y descuentos se calculan al finalizar la compra.</p>
              <div className="summary-actions grid gap-2">
                <Link to="/catalogo" className="btn-secondary text-center py-3 px-5 rounded-xl font-extrabold no-underline" style={{ background: '#fff', color: '#f04793', border: '1px solid #ffd7e7', boxShadow: '0 8px 16px rgba(255, 105, 175, 0.12)' }}>Seguir comprando</Link>
                <Link to="/checkout" className="btn-primary text-center py-4 rounded-xl font-extrabold text-white no-underline block" style={{ background: '#f04793', boxShadow: '0 12px 20px rgba(240, 71, 147, 0.22)' }}>Finalizar compra</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HtmlContentRender({ html }: { html?: string }) {
  if (!html) return null;
  return (
    <div
      className="prose prose-pink max-w-none prose-headings:text-secondary prose-a:text-primary"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function CollectionsGridRender({ title = 'Colecciones' }: { title?: string }) {
  const { data } = useQuery(COLLECTIONS, { errorPolicy: 'ignore' });
  const collections = data?.collections ?? [];
  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-secondary mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {collections.map((col: any) => (
          <Link key={col.id} to={`/coleccion/${col.slug}`} className="block aspect-square rounded-2xl overflow-hidden bg-gray-100">
            {col.imageUrl ? <img src={col.imageUrl} alt={col.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold">{col.name}</div>}
          </Link>
        ))}
      </div>
    </section>
  );
}

interface AnnouncementMessage {
  text: string;
  linkUrl?: string;
}

export function AnnouncementBarRender({ messages: cmsMessages }: { messages?: AnnouncementMessage[] }) {
  const { data } = useQuery(ANNOUNCEMENT, { errorPolicy: 'ignore' });
  const bar = data?.announcementBar;

  const hasCmsMessages = Array.isArray(cmsMessages) && cmsMessages.length > 0 && cmsMessages.some((m) => (m.text ?? '').trim());
  const items: AnnouncementMessage[] = hasCmsMessages
    ? cmsMessages!.filter((m) => (m.text ?? '').trim())
    : bar ? [{ text: bar.text, linkUrl: bar.linkUrl ?? undefined }] : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    setCurrentIndex(0);
  }, [items.length]);
  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => setCurrentIndex((i) => (i + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[currentIndex % items.length];
  const barClass = 'py-2 px-4 text-center text-white text-sm font-medium tracking-wider uppercase';
  const barStyle = { background: 'linear-gradient(90deg, #ff7bb6, #ff4f9c)' };

  return (
    <div className={barClass} style={barStyle}>
      {current.linkUrl ? (
        <a href={current.linkUrl} className="hover:underline">
          {current.text}
        </a>
      ) : (
        <span>{current.text}</span>
      )}
    </div>
  );
}

const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  HeroSection: HeroSectionRender,
  FeaturedProducts: FeaturedProductsRender,
  ProductGrid: ProductGridRender,
  CartContent: CartContentRender,
  HtmlContent: HtmlContentRender,
  CollectionsGrid: CollectionsGridRender,
  AnnouncementBar: AnnouncementBarRender,
};

interface CmsPageRendererProps {
  layout: { pageVersion?: number; root?: Array<{ id: string; type: string; props?: Record<string, unknown>; zone?: string }> };
}

export function CmsPageRenderer({ layout }: CmsPageRendererProps) {
  const announcement = useAnnouncement();
  const root = layout?.root ?? [];
  const filteredRoot = announcement?.override
    ? root.filter((node) => node.type !== 'AnnouncementBar')
    : root;
  return (
    <div>
      {filteredRoot.map((node: { id: string; type: string; props?: Record<string, unknown>; zone?: string }) => {
        const Comp = COMPONENT_MAP[node.type];
        if (!Comp) return null;
        const baseProps = node.props || {};
        const props =
          node.type === 'HeroSection'
            ? { ...baseProps, slides: Array.isArray(baseProps.slides) ? baseProps.slides : [] }
            : baseProps;
        return <Comp key={node.id} {...props} />;
      })}
    </div>
  );
}
