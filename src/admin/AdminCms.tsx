import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminFetch } from './adminApi';

const ADMIN_CMS_PAGES = `
  query AdminCmsPages {
    adminCmsPages {
      id
      slug
      title
      published
    }
  }
`;

export function AdminCms() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminFetch(ADMIN_CMS_PAGES)
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error');
        else setPages((res.data as { adminCmsPages?: any[] })?.adminCmsPages ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Cargando páginas...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-secondary mb-6">CMS - Páginas</h1>
      <p className="text-sm text-gray-500 mb-4">
        {pages.length} página(s) de contenido
      </p>
      <div className="bg-white rounded-xl shadow overflow-hidden border border-border-soft">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pages.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-secondary">{p.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.slug}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${p.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {p.published ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Ver página
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
