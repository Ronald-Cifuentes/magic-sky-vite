import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

const navItems = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/catalogo', labelKey: 'nav.catalog' },
  { to: '/nosotros', labelKey: 'nav.about' },
  { to: '/contacto', labelKey: 'nav.contact' },
];

export function Header() {
  const { t } = useTranslation();
  const { cartCount } = useCart();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode((v) => !v);
  };

  return (
    <header
      className="sticky top-0 z-20 bg-background-soft text-secondary shadow-pink"
      style={{ backgroundColor: '#ffe8f1', color: '#7c2859', boxShadow: '0 10px 30px rgba(255, 105, 175, 0.12)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link
            to="/"
            className="text-2xl font-bold text-primary"
            style={{ color: '#f04793', textShadow: '0 6px 18px rgba(240, 71, 147, 0.18)' }}
          >
            Magic Sky
          </Link>

          <nav className="hidden md:flex items-center gap-1 overflow-x-auto" style={{ whiteSpace: 'nowrap' }}>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-2 rounded-lg font-semibold text-secondary hover:bg-border-soft hover:text-primary transition-colors"
                style={{ color: '#7c2859' }}
              >
                {t(item.labelKey)}
              </Link>
            ))}
            <Link
              to="/catalogo"
              className="ml-2 px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm shadow-pink-sm"
              style={{ backgroundColor: '#f04793' }}
            >
              {t('nav.collections')}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDark}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-pink-sm border border-border-soft hover:shadow-pink-lg transition-shadow"
              aria-label={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <Link
              to="/login"
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-pink-sm border border-border-soft hover:shadow-pink-lg transition-shadow"
              aria-label={t('nav.account')}
            >
              👤
            </Link>
            <Link
              to="/carrito"
              className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-pink-sm border border-border-soft hover:shadow-pink-lg transition-shadow"
              aria-label={t('nav.cart')}
            >
              🛒
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                {cartCount}
              </span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden w-10 h-10 rounded-full bg-white flex items-center justify-center"
            >
              ☰
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border-soft">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg font-semibold text-secondary"
                >
                  {t(item.labelKey)}
                </Link>
              ))}
              <Link
                to="/catalogo"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg font-bold text-primary"
              >
                {t('nav.collections')}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
