import { Link } from 'react-router-dom';

export function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/productos"
          className="p-6 bg-white rounded-xl shadow-pink-sm border border-border-soft hover:shadow-pink"
        >
          <h2 className="font-semibold text-secondary">Productos</h2>
          <p className="text-sm text-gray-500 mt-1">Gestionar catálogo</p>
        </Link>
        <Link
          to="/admin/pedidos"
          className="p-6 bg-white rounded-xl shadow-pink-sm border border-border-soft hover:shadow-pink"
        >
          <h2 className="font-semibold text-secondary">Pedidos</h2>
          <p className="text-sm text-gray-500 mt-1">Ver y gestionar pedidos</p>
        </Link>
        <Link
          to="/admin/cms"
          className="p-6 bg-white rounded-xl shadow-pink-sm border border-border-soft hover:shadow-pink"
        >
          <h2 className="font-semibold text-secondary">CMS</h2>
          <p className="text-sm text-gray-500 mt-1">Contenido y páginas</p>
        </Link>
      </div>
    </div>
  );
}
