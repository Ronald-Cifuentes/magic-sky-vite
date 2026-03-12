import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';

const CMS_PAGE = gql`
  query CmsPageBySlug($slug: String!) {
    cmsPageBySlug(slug: $slug) {
      id
      slug
      title
      content
    }
  }
`;

interface CmsPageProps {
  slug: string;
}

export function CmsPage({ slug }: CmsPageProps) {
  const { data, loading, error } = useQuery(CMS_PAGE, {
    variables: { slug },
  });

  const page = data?.cmsPageBySlug;

  if (loading) return <div className="py-12 text-center">Cargando...</div>;
  if (error || !page) return <div className="py-12 text-center">Página no encontrada</div>;

  return (
    <div className="py-8 px-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-secondary mb-6">{page.title}</h1>
      {page.content && (
        <div
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      )}
    </div>
  );
}
