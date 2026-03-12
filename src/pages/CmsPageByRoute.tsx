import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { CmsPageRenderer } from '../admin/cms-builder/CmsPageRenderer';
import { CMS_BY_ROUTE } from '../graphql/cms-queries';

export function CmsPageByRoute() {
  const { '*': splat } = useParams<{ '*': string }>();
  const routePath = '/' + (splat || '');
  const { data, loading, error } = useQuery(CMS_BY_ROUTE, {
    variables: { routePath },
    errorPolicy: 'ignore',
  });

  const page = data?.cmsPageByRoute;

  if (loading) return <div className="py-12 text-center">Cargando...</div>;
  if (error || !page || !page.published) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Página no encontrada o no publicada</p>
      </div>
    );
  }

  const layout = page.layoutJson ? (typeof page.layoutJson === 'string' ? JSON.parse(page.layoutJson) : page.layoutJson) : null;
  return (
    <div>
      <CmsPageRenderer layout={layout || { root: [] }} />
    </div>
  );
}
