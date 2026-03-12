import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit2, FiExternalLink, FiCopy, FiTrash2, FiEye, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { adminFetch } from './adminApi';

const ADMIN_CMS_PAGES = `
  query AdminCmsPagesDetailed {
    adminCmsPagesDetailed {
      id
      title
      slug
      routePath
      pageKind
      systemKey
      published
      deletable
    }
  }
`;

const DELETE_MUTATION = `
  mutation AdminDeleteCmsPage($id: String!) {
    adminDeleteCmsPage(id: $id)
  }
`;

const DUPLICATE_MUTATION = `
  mutation AdminDuplicateCmsPage($id: String!) {
    adminDuplicateCmsPage(id: $id) {
      id
      title
      slug
    }
  }
`;

const SET_PUBLISHED_MUTATION = `
  mutation AdminSetCmsPublished($id: String!, $published: Boolean!) {
    adminSetCmsPublished(id: $id, published: $published) {
      id
      published
    }
  }
`;

const pageKindLabel: Record<string, string> = {
  SYSTEM: 'Núcleo',
  CUSTOM: 'Personalizada',
};

const systemKeyLabel: Record<string, string> = {
  HOME: 'Inicio',
  CATALOG: 'Catálogo',
  CART: 'Carrito',
  CMS_GENERIC: 'CMS',
};

export function AdminCms() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    adminFetch(ADMIN_CMS_PAGES)
      .then((res) => {
        if (res.errors) setError(res.errors[0]?.message || 'Error');
        else setPages((res.data as { adminCmsPagesDetailed?: any[] })?.adminCmsPagesDetailed ?? []);
      })
      .catch((e) => {
        const msg = e?.message || '';
        const isNetworkError = msg === 'Failed to fetch' || msg.includes('NetworkError') || msg.includes('Load failed');
        setError(
          isNetworkError
            ? 'No se pudo conectar al servidor. Asegúrate de que el backend esté corriendo en http://localhost:4000'
            : msg || 'Error al cargar'
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (p: any) => {
    if (!p.deletable) return;
    if (!confirm(`¿Eliminar "${p.title}"?`)) return;
    try {
      await adminFetch(DELETE_MUTATION, { id: p.id });
      load();
    } catch (e: any) {
      alert(e.message || 'Error al eliminar');
    }
  };

  const handleDuplicate = async (p: any) => {
    try {
      const res = await adminFetch(DUPLICATE_MUTATION, { id: p.id });
      const created = (res.data as any)?.adminDuplicateCmsPage;
      load();
      if (created?.id) navigate(`/admin/cms/${created.id}/editar`);
    } catch (e: any) {
      alert(e.message || 'Error al duplicar');
    }
  };

  const handleTogglePublish = async (p: any) => {
    try {
      await adminFetch(SET_PUBLISHED_MUTATION, { id: p.id, published: !p.published });
      load();
    } catch (e: any) {
      alert(e.message || 'Error al cambiar estado');
    }
  };

  if (loading) return <p className="text-gray-500">Cargando páginas...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const inicioPage = pages.find((p) => p.routePath === '/');
  const inicioNotPublished = inicioPage && !inicioPage.published;

  return (
    <div>
      {inicioNotPublished && (
        <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
          <p className="font-semibold">La página Inicio no está publicada.</p>
          <p className="text-sm mt-1">La tienda mostrará contenido por defecto. Publica la página para que los cambios del CMS se reflejen en la tienda.</p>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary">CMS - Páginas</h1>
          <p className="text-sm text-gray-500 mt-1">{pages.length} página(s)</p>
        </div>
        <Link
          to="/admin/cms/nuevo"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium"
        >
          + Crear página
        </Link>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden border border-border-soft">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ruta</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pages.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-secondary">{p.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.slug}</td>
                <td className="px-4 py-3 text-sm font-mono">{p.routePath}</td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-600">
                    {pageKindLabel[p.pageKind] || p.pageKind}
                    {p.systemKey ? ` (${systemKeyLabel[p.systemKey] || p.systemKey})` : ''}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${p.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {p.published ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 items-center">
                    <Link
                      to={`/admin/cms/${p.id}/preview`}
                      title="Ver preview"
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                    >
                      <FiEye size={18} />
                    </Link>
                    <Link
                      to={`/admin/cms/${p.id}/editar`}
                      title="Editar"
                      className="p-1.5 rounded hover:bg-primary/10 text-primary"
                    >
                      <FiEdit2 size={18} />
                    </Link>
                    <Link
                      to={p.routePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver en tienda"
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                    >
                      <FiExternalLink size={18} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(p)}
                      title="Duplicar"
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                    >
                      <FiCopy size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(p)}
                      title={p.published ? 'Despublicar' : 'Publicar'}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                    >
                      {p.published ? <FiToggleRight size={20} className="text-green-600" /> : <FiToggleLeft size={20} />}
                    </button>
                    {p.deletable && (
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        title="Eliminar"
                        className="p-1.5 rounded hover:bg-red-50 text-red-600"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    )}
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
