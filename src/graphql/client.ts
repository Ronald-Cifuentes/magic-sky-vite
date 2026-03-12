import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (networkError) {
    console.warn('[GraphQL] Backend no disponible. ¿Está corriendo en http://localhost:4000?');
  }
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => console.warn('[GraphQL]', message));
  }
  return forward(operation);
});

// En Docker, usar URL directa (el navegador está en el host). Localmente, usar proxy /graphql.
const graphqlUri = import.meta.env.VITE_GRAPHQL_URI || '/graphql';

const httpLink = createHttpLink({
  uri: graphqlUri,
  credentials: 'include',
});

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
});
