import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminFetch } from './adminApi';

const ADMIN_PRODUCTS = `
  query AdminProducts($limit: Float, $skip: Float) {
    adminProducts(limit: $limit, skip: $skip) {
      id
      slug
      title
      published
      status
      variants { id price title }
      images { id url }
    }
  }
`;

const DELETE_MUTATION = `
  mutation AdminDeleteProduct($id: String!) {
    adminDeleteProduct(id: $id)
  }
`;

export function AdminProductos() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = () => {
    adminFetch(ADMIN_PRODUCTS, { limit: 100 })
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error');
        else setProducts((res.data as { adminProducts?: any[] })?.adminProducts ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, []);

  const handleDelete = async (p: any) => {
    if (!confirm(`¿Eliminar "${p.title}"?`)) return;
    try {
      await adminFetch(DELETE_MUTATION, { id: p.id });
      loadProducts();
    } catch (e: any) {
      alert(e.message || 'Error al eliminar');
    }
  };

  if (loading) return <p className="text-gray-500">Cargando productos...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Productos</h1>
          <p className="text-sm text-gray-500 mt-1">
            {products.length} producto(s) en el catálogo
          </p>
        </div>
        <Link
          to="/admin/productos/nuevo"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium"
        >
          + Crear producto
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden border border-border-soft">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt="" className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded" />
                    )}
                    <span className="font-medium text-secondary">{p.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.slug}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${p.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {p.published ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  ${((p.variants?.[0]?.price ?? 0) / 100).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/productos/${p.id}/editar`}
                      className="text-primary hover:underline text-sm"
                    >
                      Editar
                    </Link>
                    <Link
                      to={`/producto/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:underline text-sm"
                    >
                      Ver tienda
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
