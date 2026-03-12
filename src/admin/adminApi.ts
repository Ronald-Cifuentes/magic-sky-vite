/**
 * Admin GraphQL API - uses Bearer token from localStorage
 */
const graphqlUrl = import.meta.env.VITE_GRAPHQL_URI || '/graphql';

export async function adminFetch<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<{ data?: T; errors?: Array<{ message: string }> }> {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    throw new Error('No admin token');
  }
  const res = await fetch(graphqlUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  const errMsg = json.errors?.[0]?.message || '';
  const isAuthError = res.status === 401 || errMsg.toLowerCase().includes('unauthorized');
  if (isAuthError) {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
    throw new Error('Sesión expirada');
  }
  if (!res.ok || json.errors?.length) {
    throw new Error(errMsg || 'Error de conexión');
  }
  return json;
}
