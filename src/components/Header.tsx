import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';

const CUSTOMER_TOKEN_KEY = 'customerToken';

const navItems = [
  { to: '/', labelKey: 'nav.home', end: true, cmsRoute: true },
  { to: '/catalogo', labelKey: 'nav.catalog', end: false, cmsRoute: true },
  { to: '/nosotros', labelKey: 'nav.about', end: true, cmsRoute: true },
  { to: '/contacto', labelKey: 'nav.contact', end: true, cmsRoute: true },
];

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface HeaderProps {
  publishedRoutes: Set<string>;
  categories?: Category[];
}

export function Header({ publishedRoutes, categories = [] }: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem(CUSTOMER_TOKEN_KEY);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    setUserMenuOpen(false);
    navigate('/');
  };

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const catButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (categoriesOpen && catButtonRef.current) {
      setDropdownRect(catButtonRef.current.getBoundingClientRect());
    } else {
      setDropdownRect(null);
    }
  }, [categoriesOpen]);

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
            {navItems
              .filter((item) => !item.cmsRoute || publishedRoutes.has(item.to))
              .map((item, i) => (
              <NavLink
                key={`${item.to}-${item.labelKey}-${i}`}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg font-semibold transition-colors ${
                    isActive ? 'bg-primary text-white' : 'text-secondary hover:bg-border-soft hover:text-primary'
                  }`
                }
                style={({ isActive }) =>
                  isActive ? { backgroundColor: '#f04793', color: '#fff' } : { color: '#7c2859' }
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
            {publishedRoutes.has('/catalogo') && (
              <div className="relative">
                <button
                  ref={catButtonRef}
                  type="button"
                  onClick={() => setCategoriesOpen((v) => !v)}
                  className="px-3 py-2 rounded-lg font-semibold text-secondary hover:bg-border-soft hover:text-primary"
                  style={{ color: '#7c2859' }}
                  aria-expanded={categoriesOpen}
                  aria-haspopup="true"
                >
                  Catálogos ⌵
                </button>
                {categoriesOpen && dropdownRect && createPortal(
                  <>
                    <div className="fixed inset-0 z-[100]" onClick={() => setCategoriesOpen(false)} aria-hidden="true" />
                    <div
                      className="fixed py-2 bg-white rounded-xl shadow-lg border border-border-soft min-w-[180px] z-[101]"
                      style={{ top: dropdownRect.bottom + 4, left: dropdownRect.left }}
                    >
                      <Link
                        to="/catalogo"
                        onClick={() => setCategoriesOpen(false)}
                        className="block px-4 py-2 text-secondary hover:bg-background-soft font-medium"
                      >
                        Todos
                      </Link>
                      {categories.map((c) => (
                        <Link
                          key={c.id}
                          to={`/catalogo?categoria=${c.slug}`}
                          onClick={() => setCategoriesOpen(false)}
                          className="block px-4 py-2 text-secondary hover:bg-background-soft font-medium"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </>,
                  document.body
                )}
              </div>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/buscar"
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-pink-sm border border-border-soft hover:shadow-pink-lg transition-shadow"
              aria-label="Buscar"
            >
              🔍
            </Link>
            <button
              onClick={toggleDark}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-pink-sm border border-border-soft hover:shadow-pink-lg transition-shadow"
              aria-label={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-pink-sm border border-border-soft hover:shadow-pink-lg transition-shadow"
                  aria-label={t('nav.account')}
                  aria-expanded={userMenuOpen}
                >
                  👤
                </button>
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-xl shadow-lg border border-border-soft z-50"
                    style={{ minWidth: '180px' }}
                  >
                    <Link
                      to="/cuenta"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-secondary hover:bg-background-soft font-medium"
                      style={{ color: '#7c2859' }}
                    >
                      Mi cuenta
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-secondary hover:bg-background-soft font-medium"
                      style={{ color: '#7c2859' }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-pink-sm border border-border-soft hover:shadow-pink-lg transition-shadow"
                aria-label={t('nav.account')}
              >
                👤
              </Link>
            )}
            {publishedRoutes.has('/carrito') && (
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
            )}
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
            {isLoggedIn && (
              <>
                <Link
                  to="/cuenta"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-secondary"
                  style={{ color: '#7c2859' }}
                >
                  👤 Mi cuenta
                </Link>
                <button
                  type="button"
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-secondary w-full text-left"
                  style={{ color: '#7c2859' }}
                >
                  Cerrar sesión
                </button>
              </>
            )}
            <Link
              to="/buscar"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-secondary mb-2"
            >
              🔍 Buscar
            </Link>
            <div className="flex flex-col gap-1">
              {navItems
                .filter((item) => !item.cmsRoute || publishedRoutes.has(item.to))
                .map((item, i) => (
                <NavLink
                  key={`${item.to}-${item.labelKey}-${i}`}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg font-semibold ${isActive ? 'bg-primary text-white' : 'text-secondary'}`
                  }
                  style={({ isActive }) => (isActive ? { backgroundColor: '#f04793', color: '#fff' } : { color: '#7c2859' })}
                >
                  {t(item.labelKey)}
                </NavLink>
              ))}
              {publishedRoutes.has('/catalogo') && (
                <div className="border-t border-border-soft pt-2 mt-2">
                  <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">Categorías</p>
                  <Link
                    to="/catalogo"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-lg font-semibold text-secondary"
                  >
                    Todos
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/catalogo?categoria=${c.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg font-semibold text-secondary"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
