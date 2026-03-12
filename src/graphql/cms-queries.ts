import { gql } from '@apollo/client/core';

export const CMS_PUBLISHED_ROUTES = gql`
  query CmsPublishedRoutes {
    cmsPublishedRoutes
  }
`;

export const CMS_BY_ROUTE = gql`
  query CmsPageByRoute($routePath: String!) {
    cmsPageByRoute(routePath: $routePath) {
      id
      title
      systemKey
      layoutJson
      published
    }
  }
`;
