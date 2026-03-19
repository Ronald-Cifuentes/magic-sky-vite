import { useState, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { FiChevronDown, FiChevronRight, FiHelpCircle, FiBell } from 'react-icons/fi';
import { AdminSearchBar } from './components/AdminSearchBar';

interface NavItem {
  to?: string;
  label: string;
  children?: { to: string; label: string }[];
}

const navItems: NavItem[] = [
  { to: '/admin/dashboard', label: 'Inicio' },
  {
    label: 'Pedidos',
    children: [
      { to: '/admin/pedidos', label: 'Todos los pedidos' },
      { to: '/admin/pedidos/borradores', label: 'Borradores' },
      { to: '/admin/pedidos/abandonados', label: 'Pedidos abandonados' },
    ],
  },
  {
    label: 'Productos',
    children: [
      { to: '/admin/productos', label: 'Todos los productos' },
      { to: '/admin/productos/colecciones', label: 'Colecciones' },
      { to: '/admin/productos/inventario', label: 'Inventario' },
      { to: '/admin/productos/ordenes-compra', label: 'Órdenes de compra' },
      { to: '/admin/productos/tarjetas-regalo', label: 'Tarjetas de regalo' },
    ],
  },
  { to: '/admin/clientes', label: 'Clientes' },
  { to: '/admin/marketing', label: 'Marketing' },
  { to: '/admin/descuentos', label: 'Descuentos' },
  { to: '/admin/cms', label: 'Contenido' },
  { to: '/admin/mercados', label: 'Mercados' },
  { to: '/admin/informes', label: 'Informes y estadísticas' },
  { to: '/admin/canales', label: 'Canales de ventas' },
  { to: '/admin/apps', label: 'Apps' },
];

export function AdminLayout() {
  const location = useLocation();
  const isLogin = location.pathname === '/admin/login';
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Pedidos', 'Productos']));
  const [globalSearch, setGlobalSearch] = useState('');

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const isActive = useCallback(
    (to: string) => {
      if (to === '/admin/productos' || to === '/admin/pedidos') {
        return location.pathname === to || location.pathname.startsWith(to + '/');
      }
      return location.pathname.startsWith(to);
    },
    [location.pathname],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('admin-global-search')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLogin) {
    return <Outlet />;
  }

  const hasToken = localStorage.getItem('adminToken');

  if (!hasToken) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-gray-900 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-700">
          <Link to="/admin/dashboard" className="text-xl font-bold text-white">
            Magic Sky Admin
          </Link>
        </div>
        <nav className="p-2 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            if (item.children) {
              const expanded = expandedSections.has(item.label);
              const hasActiveChild = item.children.some((c) => isActive(c.to));
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => toggleSection(item.label)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-left text-sm ${
                      hasActiveChild ? 'text-white bg-gray-700' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {item.label}
                    {expanded ? (
                      <FiChevronDown size={16} className="shrink-0" />
                    ) : (
                      <FiChevronRight size={16} className="shrink-0" />
                    )}
                  </button>
                  {expanded && (
                    <div className="ml-2 mt-1 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={`block px-4 py-2 rounded-lg text-sm ${
                            isActive(child.to) ? 'bg-primary/20 text-primary font-medium' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to!}
                className={`block px-4 py-2.5 rounded-lg text-sm ${
                  isActive(item.to!) ? 'bg-primary/20 text-primary font-medium' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white mt-2"
          >
            Ver tienda
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-700">
          <Link
            to="/admin/configuracion"
            className="block px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white"
          >
            Configuración
          </Link>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white text-left"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shrink-0">
          <div className="flex-1 max-w-xl">
            <AdminSearchBar
              id="admin-global-search"
              placeholder="Buscar"
              value={globalSearch}
              onChange={setGlobalSearch}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-0.5">⌘ K</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              title="Ayuda"
            >
              <FiHelpCircle size={20} />
            </button>
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              title="Notificaciones"
            >
              <FiBell size={20} />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                MS
              </div>
              <span className="text-sm font-medium text-gray-700">MS Magic Sky</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
