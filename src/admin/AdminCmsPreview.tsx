import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminFetch } from './adminApi';
import { CmsPageRenderer } from './cms-builder/CmsPageRenderer';

const PAGE_QUERY = `
  query AdminCmsPageById($id: String!) {
    adminCmsPageById(id: $id) {
      id title routePath layoutJson
    }
  }
`;

export function AdminCmsPreview() {
  const { id } = useParams();
  const [page, setPage] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    adminFetch(PAGE_QUERY, { id })
      .then((res) => {
        const p = (res.data as any)?.adminCmsPageById;
        if (!p) setError('Página no encontrada');
        else setPage(p);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!page) return <p className="text-gray-500">Cargando...</p>;

  const layout = typeof page.layoutJson === 'string' ? JSON.parse(page.layoutJson) : page.layoutJson;

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
        <span className="text-sm text-gray-600">Preview: {page.title}</span>
        <Link to={`/admin/cms/${id}/editar`} className="text-primary text-sm hover:underline">
          Volver al editor
        </Link>
      </div>
      <CmsPageRenderer layout={layout || { root: [] }} />
    </div>
  );
}
