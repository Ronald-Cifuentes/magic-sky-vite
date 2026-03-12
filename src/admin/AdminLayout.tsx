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

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/admin/dashboard" className="text-xl font-bold text-primary">
            Magic Sky Admin
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          <Link
            to="/admin/dashboard"
            className="block px-4 py-2 rounded-lg hover:bg-background-soft text-secondary"
          >
            Dashboard
          </Link>
          <Link
            to="/admin/productos"
            className="block px-4 py-2 rounded-lg hover:bg-background-soft text-secondary"
          >
            Productos
          </Link>
          <Link
            to="/admin/pedidos"
            className="block px-4 py-2 rounded-lg hover:bg-background-soft text-secondary"
          >
            Pedidos
          </Link>
          <Link
            to="/"
            className="block px-4 py-2 rounded-lg hover:bg-background-soft text-secondary"
          >
            Ver tienda
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
