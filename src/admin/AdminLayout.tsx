import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';

export function AdminLayout() {
  const location = useLocation();
  const isLogin = location.pathname === '/admin/login';

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
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/admin/dashboard" className="text-xl font-bold text-primary">
            Magic Sky Admin
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { to: '/admin/dashboard', label: 'Dashboard' },
            { to: '/admin/productos', label: 'Productos' },
            { to: '/admin/pedidos', label: 'Pedidos' },
            { to: '/admin/cms', label: 'CMS' },
          ].map(({ to, label }) => {
            const active = to === '/admin/productos' ? location.pathname.startsWith(to) : location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`block px-4 py-2 rounded-lg text-secondary ${
                  active ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-background-soft'
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            to="/"
            className="block px-4 py-2 rounded-lg hover:bg-background-soft text-secondary"
          >
            Ver tienda
          </Link>
        </nav>
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
