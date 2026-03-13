import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client/core';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import { WhatsAppButton } from './WhatsAppButton';
import { CMS_PUBLISHED_ROUTES } from '../graphql/cms-queries';

const CATEGORIES = gql`
  query Categories {
    categories {
      id
      name
      slug
    }
  }
`;

export function Layout() {
  const { data, refetch } = useQuery(CMS_PUBLISHED_ROUTES, { fetchPolicy: 'cache-first' });
  const { data: catData } = useQuery(CATEGORIES, { fetchPolicy: 'cache-first' });
  const publishedRoutes = new Set(data?.cmsPublishedRoutes ?? []);
  const categories = catData?.categories ?? [];

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [refetch]);

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header publishedRoutes={publishedRoutes} categories={categories} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer publishedRoutes={publishedRoutes} />
      <WhatsAppButton />
    </div>
  );
}
